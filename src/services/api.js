import { supabase } from '@/config/supabase'

const PAYMENT_TABLES = {
  rental: 'rental_payments',
  sale: 'sales_payments',
  sales: 'sales_payments'
}

function normalizePaymentType(type) {
  if (!type) return null
  const normalized = `${type}`.trim().toLowerCase()
  if (!PAYMENT_TABLES[normalized]) return null
  return normalized === 'sale' ? 'sales' : normalized
}

function buildPaymentQuery(table, filters) {
  let query = supabase
    .from(table)
    .select('*')
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

  const limit = filters.limit || 1000
  query = query.limit(limit)

  return query
}

// Fetch rental transactions
export async function fetchRentalTransactions(filters = {}) {
  try {
    let query = supabase
      .from('rental_transactions')
      .select('*')
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

    const { data, error } = await query.limit(filters.limit || 1000)

    if (error) throw error
    return { success: true, data }
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
      .select('*')
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

    const { data, error } = await query.limit(filters.limit || 1000)

    if (error) throw error
    return { success: true, data }
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

    const results = await Promise.all(
      tableTargets.map(({ table }) => buildPaymentQuery(table, filters))
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

    const limit = filters.limit || 1000
    return { success: true, data: mergedPayments.slice(0, limit) }
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
      .select('*')
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

    const { data, error } = await query.limit(filters.limit || 1000)

    if (error) throw error
    return { success: true, data }
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
    const [rentalsResult, salesResult, paymentsResult] = await Promise.all([
      fetchRentalTransactions({ dateFrom: fromDate, dateTo: toDate }),
      fetchSalesTransactions({ dateFrom: fromDate, dateTo: toDate }),
      fetchPayments({ dateFrom: fromDate, dateTo: toDate })
    ])

    const rentals = rentalsResult.data || []
    const sales = salesResult.data || []
    const payments = paymentsResult.data || []

    // Calculate statistics
    const stats = {
      totalRentals: rentals.length,
      totalSales: sales.length,
      totalTransactions: rentals.length + sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + (parseFloat(s.total_amount) || 0), 0),
      totalRentalIncome: rentals.reduce((sum, r) => sum + (parseFloat(r.total_amount) || 0), 0),
      totalPayments: payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0),
      activeRentals: rentals.filter(r => r.status === 'active').length,
      completedSales: sales.filter(s => s.status === 'completed').length,
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return { success: false, error: error.message }
  }
}
