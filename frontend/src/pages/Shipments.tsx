import { useState } from 'react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Modal from '@/components/ui/Modal'
import { useShipments, useCreateShipment, useUpdateShipment } from '@/hooks/useApi'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShipmentSchema, type ShipmentFormData } from '@/schemas'
import { Truck, Plus, Pencil, ChevronLeft, ChevronRight, AlertCircle, Package } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import type { Shipment } from '@/types'

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

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: '0', label: 'Created' },
  { value: '1', label: 'In Transit' },
  { value: '2', label: 'At Checkpoint' },
  { value: '3', label: 'Delivered' },
]

const DEFAULT_LIMIT = 10

export default function Shipments() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null)

  const {
    data,
    isLoading,
    error,
  } = useShipments(page, DEFAULT_LIMIT, statusFilter)

  const createShipment = useCreateShipment()
  const updateShipment = useUpdateShipment()

  const shipments: Shipment[] = Array.isArray(data) ? data : data?.items ?? []
  const total = Array.isArray(data) ? data.length : data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_LIMIT))

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShipmentFormData>({
    resolver: zodResolver(ShipmentSchema),
    defaultValues: {
      product_id: '',
      origin: '',
      destination: '',
      notes: '',
    },
  })

  const openAddModal = () => {
    setEditingShipment(null)
    reset({ product_id: '', origin: '', destination: '', notes: '' })
    setModalOpen(true)
  }

  const openEditModal = (shipment: Shipment) => {
    setEditingShipment(shipment)
    reset({
      product_id: shipment.product_id,
      origin: shipment.origin,
      destination: shipment.destination,
      notes: shipment.notes ?? '',
    })
    setModalOpen(true)
  }

  const onSubmit = async (formData: ShipmentFormData) => {
    try {
      if (editingShipment) {
        await updateShipment.mutateAsync({
          id: String(editingShipment.id),
          data: formData,
        })
      } else {
        await createShipment.mutateAsync(formData)
      }
      setModalOpen(false)
      reset()
      setEditingShipment(null)
    } catch {
      // Error handled by mutation state
    }
  }

  const isMutating = createShipment.isPending || updateShipment.isPending
  const mutationError = createShipment.error || updateShipment.error

  return (
    <div className="animate-fade-in space-y-6 px-6 sm:px-12 lg:px-20">
      {/* ─── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="h-px w-8 bg-accent/40" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/60">
              Supply Chain
            </span>
          </div>
          <h1 className="font-serif text-3xl leading-[1.1] tracking-tight text-text sm:text-4xl">
            Shipments
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted">
            Manage and track product shipments across the supply chain.
          </p>
        </div>
        <Button onClick={openAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Shipment
        </Button>
      </div>

      {/* ─── Filters ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted/40" />
            <span className="text-sm text-muted">Status Filter</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-xl border border-white/[0.06] bg-bg py-2.5 pl-3 pr-8 text-sm text-text outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/10 sm:w-auto"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-5 backdrop-blur-xl">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-medium text-red-400">Failed to load shipments</p>
            <p className="text-sm text-red-400/70">
              {error instanceof Error ? error.message : 'Please try again later.'}
            </p>
          </div>
        </div>
      )}

      {/* ─── Table ─────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : shipments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-12 w-12 text-muted/20" />
            <p className="mt-4 text-sm text-muted">No shipments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Shipment ID</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Product ID</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Origin</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Destination</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Status</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Created</th>
                  <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-muted/60">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {shipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-mono text-text">
                      {shipment.shipment_id}
                    </td>
                    <td className="px-6 py-4 font-mono text-muted">
                      {shipment.product_id}
                    </td>
                    <td className="px-6 py-4 text-text">{shipment.origin}</td>
                    <td className="px-6 py-4 text-text">{shipment.destination}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariant[shipment.status] || 'default'}>
                        {statusLabels[shipment.status] || shipment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {formatDate(shipment.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditModal(shipment)}
                        className="rounded-lg p-2 text-muted/40 transition-colors hover:bg-white/[0.04] hover:text-text"
                        aria-label={`Edit shipment ${shipment.shipment_id}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && shipments.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/[0.06] px-6 py-4">
            <p className="text-sm text-muted">
              Page <span className="text-text">{page}</span> of{' '}
              <span className="text-text">{totalPages}</span>{' '}
              <span className="text-muted/50">({total} total)</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="px-3"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="px-3"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ─── Add/Edit Modal ────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!isMutating) {
            setModalOpen(false)
            setEditingShipment(null)
            reset()
          }
        }}
        title={editingShipment ? 'Edit Shipment' : 'Add Shipment'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {mutationError && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-400">
              {mutationError instanceof Error ? mutationError.message : 'An error occurred'}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Product ID
            </label>
            <input
              {...register('product_id')}
              placeholder="e.g., PROD-8842"
              className="w-full rounded-xl border border-white/[0.06] bg-bg py-2.5 px-4 text-sm text-text placeholder-muted/40 outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/10"
            />
            {errors.product_id && (
              <p className="mt-1 text-xs text-red-400">{errors.product_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Origin
              </label>
              <input
                {...register('origin')}
                placeholder="Origin location"
                className="w-full rounded-xl border border-white/[0.06] bg-bg py-2.5 px-4 text-sm text-text placeholder-muted/40 outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/10"
              />
              {errors.origin && (
                <p className="mt-1 text-xs text-red-400">{errors.origin.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-text">
                Destination
              </label>
              <input
                {...register('destination')}
                placeholder="Destination location"
                className="w-full rounded-xl border border-white/[0.06] bg-bg py-2.5 px-4 text-sm text-text placeholder-muted/40 outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/10"
              />
              {errors.destination && (
                <p className="mt-1 text-xs text-red-400">{errors.destination.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text">
              Notes <span className="text-muted">(optional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Additional notes..."
              className="w-full rounded-xl border border-white/[0.06] bg-bg py-2.5 px-4 text-sm text-text placeholder-muted/40 outline-none transition-colors focus:border-accent/30 focus:ring-1 focus:ring-accent/10"
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-red-400">{errors.notes.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false)
                setEditingShipment(null)
                reset()
              }}
              disabled={isMutating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? <LoadingSpinner size="sm" /> : editingShipment ? 'Save Changes' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
