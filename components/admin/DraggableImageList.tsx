'use client'

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Image from 'next/image'
import type { ShootImage } from '@/types'

interface DraggableImageListProps {
  images: ShootImage[]
  onReorder: (images: ShootImage[]) => void
  onSetThumbnail: (id: number) => void
  onRemove: (id: number) => void
  removingId: number | null
}

interface SortableItemProps {
  image: ShootImage
  onSetThumbnail: (id: number) => void
  onRemove: (id: number) => void
  removingId: number | null
}

function SortableItem({ image, onSetThumbnail, onRemove, removingId }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const isThumbnail = Boolean(image.is_thumbnail)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 py-3 border-b border-black/5 last:border-0"
    >
      {/* Drag handle — full-width touch target */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-6 text-center text-black/25 cursor-grab active:cursor-grabbing select-none text-xs"
        aria-label="Drag to reorder"
      >
        &#9776;
      </div>

      {/* Thumbnail preview */}
      {image.cloudinary_url && (
        <div className="flex-shrink-0 relative w-14 h-20 bg-neutral-100 overflow-hidden">
          <Image
            src={image.cloudinary_url}
            alt=""
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      )}

      {/* Filename */}
      <span className="flex-1 text-xs text-black/50 truncate min-w-0">
        {image.filename.split('/').pop()}
      </span>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onSetThumbnail(image.id)}
          className={`text-[11px] tracking-wider uppercase transition-colors duration-150 ${
            isThumbnail ? 'text-accent font-medium' : 'text-black/40 hover:text-black'
          }`}
        >
          {isThumbnail ? 'Thumbnail' : 'Set as Thumbnail'}
        </button>

        <button
          type="button"
          onClick={() => onRemove(image.id)}
          disabled={removingId === image.id}
          className="text-[11px] tracking-wider uppercase text-black/30 hover:text-black transition-colors duration-150 disabled:opacity-40"
        >
          {removingId === image.id ? 'Removing...' : 'Remove Image'}
        </button>
      </div>
    </div>
  )
}

export default function DraggableImageList({
  images,
  onReorder,
  onSetThumbnail,
  onRemove,
  removingId,
}: DraggableImageListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id)
      const newIndex = images.findIndex((img) => img.id === over.id)
      onReorder(arrayMove(images, oldIndex, newIndex))
    }
  }

  if (images.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
        <div>
          {images.map((image) => (
            <SortableItem
              key={image.id}
              image={image}
              onSetThumbnail={onSetThumbnail}
              onRemove={onRemove}
              removingId={removingId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
