import { supabase } from '@/config/supabase'

const PAYMENT_TABLES = {
  rental: 'rental_payments',
  sale: 'sales_payments',
  sales: 'sales_payments'
}
const NET_PROFIT_VIEW = 'sales_profit_view'

function normalizePaymentType(type) {
  if (!type) return null
  const normalized = `${type}`.trim().toLowerCase()
  if (!PAYMENT_TABLES[normalized]) return null
  return normalized === 'sale' ? 'sales' : normalized
}

function buildPaymentQuery(table, filters) {
  let query = supabase
    .from(table)
    .select('*', { count: 'exact' })
    .order('payment_date', { ascending: false })

  if (filters.dateFrom) {
    query = query.gte('payment_date', filters.dateFrom)
  }
  if (filters.dateTo) {
    query = query.lte('payment_date', filters.dateTo)
  }
  if (filters.paymentMethod) {
    query = query.eq('payment_method', filters.paymentMethod)
  }

  return query
}

async function fetchNetProfitFromView(dateFrom, dateTo) {
  try {
    let query = supabase
      .from(NET_PROFIT_VIEW)
      .select('laba_total, sale_date')

    if (dateFrom) {
      query = query.gte('sale_date', dateFrom)
    }
    if (dateTo) {
      query = query.lte('sale_date', dateTo)
    }

    const { data, error } = await query
    if (error) throw error

    const netProfit = (data || []).reduce((sum, row) => sum + (parseFloat(row.laba_total) || 0), 0)
    return { success: true, netProfit }
  } catch (error) {
    const code = error?.code || error?.details
    if (code === 'PGRST205' || `${error?.message || ''}`.includes('Could not find the table')) {
      return { success: false, missing: true, netProfit: null }
    }
    throw error
  }
}

export async function fetchSalesNetProfit(dateFrom, dateTo) {
  try {
    const result = await fetchNetProfitFromView(dateFrom, dateTo)
    if (result.success) {
      return { success: true, netProfit: result.netProfit }
    }
    if (result.missing) {
      return { success: false, missing: true, netProfit: null }
    }
    return { success: false, netProfit: null }
  } catch (error) {
    console.error('Error fetching sales net profit:', error)
    return { success: false, error: error.message }
  }
}

// Fetch rental transactions
export async function fetchRentalTransactions(filters = {}) {
  try {
    let query = supabase
      .from('rental_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.dateFrom) {
      query = query.gte('rental_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('rental_date', filters.dateTo)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const limit = filters.limit || 1000
    const page = filters.page || 1
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)

    if (error) throw error
    return { success: true, data, count }
  } catch (error) {
    console.error('Error fetching rental transactions:', error)
    return { success: false, error: error.message }
  }
}

// Fetch rental transaction details
export async function fetchRentalTransactionDetails(transactionId) {
  try {
    const { data, error } = await supabase
      .from('rental_transaction_details')
      .select('*')
      .eq('rental_transaction_id', transactionId)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching rental transaction details:', error)
    return { success: false, error: error.message }
  }
}

// Fetch sales transactions
export async function fetchSalesTransactions(filters = {}) {
  try {
    let query = supabase
      .from('sales_transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.dateFrom) {
      query = query.gte('sale_date', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('sale_date', filters.dateTo)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    const limit = filters.limit || 1000
    const page = filters.page || 1
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)

    if (error) throw error
    return { success: true, data, count }
  } catch (error) {
    console.error('Error fetching sales transactions:', error)
    return { success: false, error: error.message }
  }
}

// Fetch sales transaction details
export async function fetchSalesTransactionDetails(transactionId) {
  try {
    const { data, error } = await supabase
      .from('sales_transaction_details')
      .select('*')
      .eq('sales_transaction_id', transactionId)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching sales transaction details:', error)
    return { success: false, error: error.message }
  }
}

// Fetch payments
export async function fetchPayments(filters = {}) {
  try {
    const normalizedType = normalizePaymentType(filters.transactionType)
    const tableTargets = normalizedType
      ? [{ table: PAYMENT_TABLES[normalizedType], type: normalizedType }]
      : [
          { table: PAYMENT_TABLES.rental, type: 'rental' },
          { table: PAYMENT_TABLES.sales, type: 'sales' }
        ]

    const limit = filters.limit || 1000
    const page = filters.page || 1

    if (normalizedType) {
      const from = (page - 1) * limit
      const to = from + limit - 1
      const { data, error, count } = await buildPaymentQuery(tableTargets[0].table, filters).range(from, to)
      if (error) throw error
      const mergedPayments = (data || []).map(payment => ({
        ...payment,
        transaction_type: tableTargets[0].type
      }))
      return { success: true, data: mergedPayments, count }
    }

    const maxRows = page * limit
    const results = await Promise.all(
      tableTargets.map(({ table }) => buildPaymentQuery(table, filters).range(0, maxRows - 1))
    )

    const mergedPayments = results.flatMap((result, index) => {
      if (result.error) {
        throw result.error
      }
      const type = tableTargets[index].type
      return (result.data || []).map(payment => ({
        ...payment,
        transaction_type: type
      }))
    })

    mergedPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date))

    const from = (page - 1) * limit
    const to = from + limit
    const totalCount = results.reduce((sum, result) => sum + (result.count || 0), 0)
    return { success: true, data: mergedPayments.slice(from, to), count: totalCount }
  } catch (error) {
    console.error('Error fetching payments:', error)
    return { success: false, error: error.message }
  }
}

// Fetch stock movements
export async function fetchStockMovements(filters = {}) {
  try {
    let query = supabase
      .from('stock_movements')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo)
    }
    if (filters.movementType) {
      query = query.eq('movement_type', filters.movementType)
    }

    const limit = filters.limit || 1000
    const page = filters.page || 1
    const from = (page - 1) * limit
    const to = from + limit - 1
    const { data, error, count } = await query.range(from, to)

    if (error) throw error
    return { success: true, data, count }
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return { success: false, error: error.message }
  }
}

// Get dashboard statistics
export async function getDashboardStats(dateFrom, dateTo) {
  try {
    // Get date range
    const fromDate = dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const toDate = dateTo || new Date().toISOString().split('T')[0]

    // Fetch all data in parallel
    const [rentalsResult, salesResult] = await Promise.all([
      fetchRentalTransactions({ dateFrom: fromDate, dateTo: toDate }),
      fetchSalesTransactions({ dateFrom: fromDate, dateTo: toDate })
    ])

    const rentals = rentalsResult.data || []
    const sales = salesResult.data || []
    const validSales = sales.filter(s => s.status?.toLowerCase() !== 'cancelled')
    const validRentals = rentals.filter(r => r.status?.toLowerCase() !== 'cancelled')

    const netProfitFromView = await fetchNetProfitFromView(fromDate, toDate)
    const netProfit = netProfitFromView.success ? netProfitFromView.netProfit : null

    // Calculate statistics
    const stats = {
      totalRentals: rentals.length,
      totalSales: sales.length,
      totalTransactions: rentals.length + sales.length,
      totalRevenue: validSales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0),
      totalRentalIncome: validRentals.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0),
      totalPayments:
        validSales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0) +
        validRentals.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0),
      activeRentals: rentals.filter(r => r.status === 'active').length,
      completedSales: sales.filter(s => s.status === 'completed').length,
      netProfit
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return { success: false, error: error.message }
  }
}
