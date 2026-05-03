import { useState, useMemo } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import {
  useProductsPaginated,
  useProduct,
  useProductHistory,
  useProductTransfers,
  useCreateProduct,
  useUpdateProduct,
} from '@/hooks/useApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProductSchema, type ProductFormData } from '@/schemas'
import {
  Search,
  MapPin,
  User,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Package,
  Plus,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { formatAddress, formatDate } from '@/utils/formatters'
import type { Product, Checkpoint, CustodyTransfer } from '@/types'

const statusLabels: Record<string, string> = {
  '0': 'Created',
  '1': 'In Transit',
  '2': 'At Checkpoint',
  '3': 'Delivered',
}

const statusVariant: Record<string, 'default' | 'blue' | 'orange' | 'success'> = {
  '0': 'default',
  '1': 'blue',
  '2': 'orange',
  '3': 'success',
}

const DEFAULT_LIMIT = 10

export default function Products() {
  // ─── Table / Registry State ───────────────────────────────────────────────
  const [page, setPage] = useState(1)
  const [nameSearch, setNameSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const {
    data: paginatedData,
    isLoading: tableLoading,
    error: tableError,
  } = useProductsPaginated(page, DEFAULT_LIMIT)

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const rawItems: Product[] = Array.isArray(paginatedData)
    ? paginatedData
    : paginatedData?.items ?? []
  const totalRaw = Array.isArray(paginatedData)
    ? paginatedData.length
    : paginatedData?.total ?? 0

  const filteredItems = useMemo(() => {
    const term = nameSearch.trim().toLowerCase()
    if (!term) return rawItems
    return rawItems.filter((p) => p.name.toLowerCase().includes(term))
  }, [rawItems, nameSearch])

  const totalPages = Math.max(1, Math.ceil(totalRaw / DEFAULT_LIMIT))

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setNameSearch(value)
    setPage(1)
  }

  // ─── Lookup State (existing) ──────────────────────────────────────────────
  const [searchId, setSearchId] = useState('')
  const [submittedId, setSubmittedId] = useState('')

  const {
    data: productDetail,
    isLoading: productLoading,
    error: productError,
  } = useProduct(submittedId)

  const {
    data: historyData,
    isLoading: historyLoading,
  } = useProductHistory(submittedId)

  const {
    data: transfersData,
    isLoading: transfersLoading,
  } = useProductTransfers(submittedId)

  const handleLookupSearch = () => {
    if (!searchId.trim()) return
    setSubmittedId(searchId.trim())
  }

  const product = productDetail?.product
  const history: Checkpoint[] = historyData ?? []
  const transfers: CustodyTransfer[] = transfersData ?? []
  const isDelivered = history.some((c) => c.status === '3')
  const loadingDetail = productLoading || historyLoading || transfersLoading

  const isNotFound =
    productError instanceof Error &&
    (productError.message.includes('404') || productError.message.includes('not found'))

  // ─── Form ─────────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: '',
      manufacturer: '',
      metadata_uri: '',
    },
  })

  const openAddModal = () => {
    setEditingProduct(null)
    reset({ name: '', manufacturer: '', metadata_uri: '' })
    setModalOpen(true)
  }

  const openEditModal = (productItem: Product) => {
    setEditingProduct(productItem)
    reset({
      name: productItem.name,
      manufacturer: productItem.manufacturer_address,
      metadata_uri: productItem.metadata_uri ?? '',
    })
    setModalOpen(true)
  }

  const viewProduct = (productId: string) => {
    setSearchId(productId)
    setSubmittedId(productId)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
  }

  const onSubmit = async (formData: ProductFormData) => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: String(editingProduct.id),
          data: formData,
        })
      } else {
        await createProduct.mutateAsync(formData)
      }
      setModalOpen(false)
      reset()
      setEditingProduct(null)
    } catch {
      // Error handled by mutation state
    }
  }

  const isMutating = createProduct.isPending || updateProduct.isPending
  const mutationError = createProduct.error || updateProduct.error

  return (
    <div className="animate-fade-in space-y-8">
      {/* ─── Registry Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-serif text-3xl text-text sm:text-4xl">Products</h1>
          <p className="max-w-2xl text-muted">
            Browse registered products, manage records, or search by ID to inspect
            blockchain history and custody transfers.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* ─── Filters ──────────────────────────────────────────────────────── */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Filter by product name..."
              value={nameSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-button border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>
        </div>
      </Card>

      {/* ─── Table Error ──────────────────────────────────────────────────── */}
      {tableError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Failed to load products</p>
            <p className="text-sm text-red-400/70">
              {tableError instanceof Error ? tableError.message : 'Please try again later.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Products Table ───────────────────────────────────────────────── */}
      <Card className="overflow-hidden p-0">
        {tableLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted/30" />
            <p className="mt-4 text-muted">
              {nameSearch ? 'No products match your search' : 'No products registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface2/50">
                <tr>
                  <th className="px-6 py-3 font-medium text-muted">Product ID</th>
                  <th className="px-6 py-3 font-medium text-muted">Name</th>
                  <th className="px-6 py-3 font-medium text-muted">Manufacturer</th>
                  <th className="px-6 py-3 font-medium text-muted">Registered</th>
                  <th className="px-6 py-3 font-medium text-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-surface2/30"
                  >
                    <td className="px-6 py-4 font-mono text-text">
                      {item.product_id}
                    </td>
                    <td className="px-6 py-4 text-text">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-muted">
                      {formatAddress(item.manufacturer_address)}
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {formatDate(item.registered_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => viewProduct(item.product_id)}
                          className="rounded-button p-2 text-muted transition-colors hover:bg-surface2 hover:text-text"
                          aria-label={`View ${item.product_id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="rounded-button p-2 text-muted transition-colors hover:bg-surface2 hover:text-text"
                          aria-label={`Edit ${item.product_id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!tableLoading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-6 py-4">
            <p className="text-sm text-muted">
              Page <span className="text-text">{page}</span> of{' '}
              <span className="text-text">{totalPages}</span>{' '}
              <span className="text-muted/70">({totalRaw} total)</span>
              {nameSearch && (
                <span className="ml-2 text-accent">
                  filtered from current page
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || tableLoading}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || tableLoading}
                className="px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ─── Product Lookup (existing) ────────────────────────────────────── */}
      <div className="space-y-2">
        <h2 className="font-serif text-2xl text-text sm:text-3xl">
          Product Lookup
        </h2>
        <p className="max-w-2xl text-muted">
          Search for a product by ID to view its complete blockchain history,
          custody transfers, and verification status.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Enter product ID (e.g., PROD-8842)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookupSearch()}
              className="w-full rounded-button border border-border bg-bg py-2.5 pl-10 pr-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
          </div>
          <Button onClick={handleLookupSearch} disabled={loadingDetail} className="min-w-[120px]">
            {loadingDetail ? <LoadingSpinner size="sm" /> : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Not Found */}
      {isNotFound && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Product Not Found</p>
            <p className="text-sm text-red-400/70">
              No product with ID &quot;{submittedId}&quot; was found on the blockchain.
            </p>
          </div>
        </div>
      )}

      {/* Error (other than 404) */}
      {productError && !isNotFound && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Error</p>
            <p className="text-sm text-red-400/70">
              {productError instanceof Error ? productError.message : 'Failed to load product'}
            </p>
          </div>
        </div>
      )}

      {/* Product Details */}
      {product && !loadingDetail && (
        <div className="space-y-6">
          {/* Product Info Card */}
          <Card variant="accent">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-mono text-xl font-semibold text-text">
                    {product.product_id}
                  </h2>
                  <Badge variant={isDelivered ? 'success' : 'blue'}>
                    {isDelivered ? 'Delivered' : 'In Transit'}
                  </Badge>
                </div>
                <h3 className="text-lg text-text">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-muted">{product.description}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Manufacturer: {formatAddress(product.manufacturer_address)}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Registered {formatDate(product.registered_at)}
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-accent/5 p-4 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-accent" />
                <p className="mt-2 text-xs font-medium text-accent">Blockchain Verified</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Shipment Timeline */}
            <Card className="lg:col-span-2">
              <h3 className="mb-6 font-semibold text-text">Shipment Timeline</h3>
              {history.length === 0 ? (
                <p className="text-sm text-muted">No checkpoint history available.</p>
              ) : (
                <div className="relative space-y-0">
                  {/* Vertical line */}
                  <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />
                  {history.map((checkpoint) => (
                    <div key={checkpoint.id} className="relative flex gap-4 pb-8 last:pb-0">
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                          checkpoint.status === '3'
                            ? 'border-accent bg-accent/10'
                            : 'border-muted bg-surface2'
                        }`}
                      >
                        {checkpoint.status === '3' ? (
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                        ) : (
                          <div className="h-2.5 w-2.5 rounded-full bg-muted" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text">
                            {checkpoint.notes || statusLabels[checkpoint.status] || 'Update'}
                          </p>
                          <span className="font-mono text-xs text-muted">
                            {formatDate(checkpoint.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {checkpoint.location}
                        </p>
                        <Badge variant={statusVariant[checkpoint.status] || 'default'} className="mt-1">
                          {statusLabels[checkpoint.status] || checkpoint.status}
                        </Badge>
                        <p className="font-mono text-xs text-muted/60">
                          By {formatAddress(checkpoint.handler_address)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Custody History */}
            <Card>
              <h3 className="mb-6 font-semibold text-text">Custody Transfers</h3>
              {transfers.length === 0 ? (
                <p className="text-sm text-muted">No custody transfers available.</p>
              ) : (
                <div className="space-y-4">
                  {transfers.map((transfer) => (
                    <div
                      key={transfer.id}
                      className="rounded-lg bg-surface2 p-3 transition-colors hover:bg-surface2/80"
                    >
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="font-mono">{formatAddress(transfer.from_address)}</span>
                        <ArrowRight className="h-3 w-3 text-accent" />
                        <span className="font-mono">{formatAddress(transfer.to_address)}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted/60">
                        {formatDate(transfer.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {!product && !loadingDetail && !productError && !submittedId && (
        <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-border py-16 text-center">
          <Package className="h-12 w-12 text-muted/30" />
          <p className="mt-4 text-muted">Enter a product ID to view its details</p>
        </div>
      )}

      {/* ─── Add/Edit Modal ───────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!isMutating) {
            setModalOpen(false)
            setEditingProduct(null)
            reset()
          }
        }}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mutationError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {mutationError instanceof Error ? mutationError.message : 'An error occurred'}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Product Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g., Organic Coffee Beans"
              className="w-full rounded-button border border-border bg-bg py-2.5 px-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Manufacturer Address
            </label>
            <input
              {...register('manufacturer')}
              placeholder="0x..."
              className="w-full rounded-button border border-border bg-bg py-2.5 px-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            {errors.manufacturer && (
              <p className="mt-1 text-xs text-red-400">{errors.manufacturer.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Metadata URI <span className="text-muted">(optional)</span>
            </label>
            <input
              {...register('metadata_uri')}
              placeholder="https://..."
              className="w-full rounded-button border border-border bg-bg py-2.5 px-4 text-sm text-text placeholder-muted outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/20"
            />
            {errors.metadata_uri && (
              <p className="mt-1 text-xs text-red-400">{errors.metadata_uri.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditingProduct(null)
                reset()
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? (
                <LoadingSpinner size="sm" />
              ) : editingProduct ? (
                'Save Changes'
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
