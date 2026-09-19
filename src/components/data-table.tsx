"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  FlexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type ColumnVisibilityState,
  type Row,
  type SortingState,
} from "@tanstack/react-table"
import { toast } from "sonner"
import { z } from "zod"

import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  DotsSixVerticalIcon,
  DotsThreeVerticalIcon,
  ColumnsIcon,
  CaretDownIcon,
  PlusIcon,
  CaretDoubleLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretDoubleRightIcon,
  ArrowsDownUpIcon,
} from "@phosphor-icons/react"

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
})

export const schema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string().optional(),
  price: z.number(),
  description: z.string(),
  categoryId: z.number().optional(),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  images: z.array(z.string()),
})

export type ProductType = z.infer<typeof schema>

export type CategoryType = {
  id: number
  name: string
  slug: string
  image: string
  creationAt: string
  updatedAt: string
}

const columnHelper = createColumnHelper<
  typeof features,
  ProductType
>()

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <DotsSixVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

const createColumns = (
  categories: CategoryType[],
  onDeleteProduct?: (id: number) => void,
  onUpdateProduct?: (product: Partial<ProductType>) => void
) =>
  columnHelper.columns([
    columnHelper.display({
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    }),
    columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }),
    columnHelper.accessor("title", {
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[180px] sm:max-w-[220px] truncate">
          <TableCellViewer item={row.original} categories={categories} onUpdateProduct={onUpdateProduct} />
        </div>
      ),
      enableHiding: false,
    }),
    columnHelper.accessor("slug", {
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground font-mono text-xs">
          {row.original.slug}
        </span>
      ),
    }),
    columnHelper.accessor(
      (row) => {
        const catId = row.categoryId ?? row.category?.id
        const found = categories.find((c) => c.id === catId)
        return found?.name || row.category?.name || "Uncategorized"
      },
      {
        id: "category",
        header: "Category",
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue || filterValue === "all") return true
          const catId = row.original.categoryId ?? row.original.category?.id
          const found = categories.find((c) => c.id === catId)
          const categoryName = found?.name || row.category?.name || "Uncategorized"
          return categoryName.toLowerCase() === filterValue.toLowerCase()
        },
        cell: ({ row }) => {
          const catId = row.original.categoryId ?? row.original.category?.id
          const categoryName = row.original.category?.name || categories.find((c) => c.id === catId)?.name
          return (
            <div className="w-32">
              <Badge variant="outline" className="px-1.5 text-muted-foreground truncate">
                {categoryName ? categoryName : "Uncategorized"}
              </Badge>
            </div>
          )
        },
      }
    ),
    columnHelper.accessor("price", {
      header: () => <div className="w-full text-right">Price</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${row.original.price.toFixed(2)}
        </div>
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-muted-foreground">
          {row.original.description}
        </div>
      ),
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-open:bg-muted"
                size="icon"
              />
            }
          >
            <DotsThreeVerticalIcon />
            <span className="sr-only">Open menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => toast.info(`Editing ${row.original.title}`)}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => {
                if (onDeleteProduct) {
                  onDeleteProduct(row.original.id)
                }
                toast.success(`Deleted ${row.original.title}`)
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ])

function DraggableRow({
  row,
}: {
  row: Row<typeof features, ProductType>
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          <FlexRender cell={cell} />
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
  categories = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}: {
  data: ProductType[]
  categories?: CategoryType[]
  onAddProduct?: (product: Partial<ProductType>) => void
  onUpdateProduct?: (product: Partial<ProductType>) => void
  onDeleteProduct?: (id: number) => void
}) {
  const sortedInitialData = React.useMemo(() => {
    return [...initialData].sort((a, b) => b.id - a.id)
  }, [initialData])

  const [data, setData] = React.useState(() => sortedInitialData)
  const [searchQuery, setSearchQuery] = React.useState("")

  React.useEffect(() => {
    setData([...initialData].sort((a, b) => b.id - a.id))
  }, [initialData])

  // Filter data by search query on title before sending to table
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data
    return data.filter((item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [data, searchQuery])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<ColumnVisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => filteredData?.map(({ id }) => id) || [],
    [filteredData]
  )

  const columns = React.useMemo(
    () => createColumns(categories, onDeleteProduct, onUpdateProduct),
    [categories, onDeleteProduct, onUpdateProduct]
  )

  const table = useTable({
    features,
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const categoryFilterValue =
    (table.getColumn("category")?.getFilterValue() as string) ?? "all"

  return (
    <Tabs
      defaultValue="all-products"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
        <TabsList>
          <TabsTrigger value="all-products">All Products</TabsTrigger>
        </TabsList>
        <div className="flex flex-wrap items-center gap-2">
          {/* Global Search Input */}
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                setSearchQuery((event.target as HTMLInputElement).value)
              }
            }}
            className="h-9 w-full sm:w-56"
          />

          {/* Filter by Category Select */}
          <Select
            value={categoryFilterValue}
            onValueChange={(val) => {
              table.getColumn("category")?.setFilterValue(val === "all" ? undefined : val)
            }}
          >
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Sort by Name Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="h-9" />}
            >
              <ArrowsDownUpIcon data-icon="inline-start" />
              Sort: Name
              <CaretDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => table.getColumn("title")?.toggleSorting(false)}
              >
                Ascending (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => table.getColumn("title")?.toggleSorting(true)}
              >
                Descending (Z-A)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => table.getColumn("title")?.clearSorting()}
              >
                Clear Sort
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Column Visibility Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="h-9" />}
            >
              <ColumnsIcon data-icon="inline-start" />
              Columns
              <CaretDownIcon data-icon="inline-end" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Product Dialog Button */}
          <AddProductDialog categories={categories} onAddProduct={onAddProduct} />
        </div>
      </div>
      <TabsContent
        value="all-products"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder ? null : (
                            <FlexRender header={header} />
                          )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.state.pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <CaretDoubleLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <CaretLeftIcon />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <CaretRightIcon />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <CaretDoubleRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

function AddProductDialog({
  categories,
  onAddProduct,
}: {
  categories: CategoryType[]
  onAddProduct?: (product: Partial<ProductType>) => void
}) {
  const isMobile = useIsMobile()
  const defaultCategoryId = categories.length > 0 ? categories[0].id : 1
  const [open, setOpen] = React.useState(false)

  const [form, setForm] = React.useState({
    title: "",
    price: 0,
    description: "",
    categoryId: defaultCategoryId,
    images: ["https://picsum.photos/640/480"],
  })

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button variant="outline" size="sm" className="h-9">
            <PlusIcon />
            <span className="hidden lg:inline">Add Product</span>
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Add New Product</DrawerTitle>
          <DrawerDescription>Fill in the details to add a new product</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="new-title">Title</Label>
              <Input
                id="new-title"
                placeholder="Product title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="new-price">Price</Label>
                <Input
                  id="new-price"
                  type="number"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="new-category">Category</Label>
                <Select
                  value={String(form.categoryId)}
                  onValueChange={(val) => handleChange("categoryId", Number(val))}
                >
                  <SelectTrigger id="new-category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="new-description">Description</Label>
              <Input
                id="new-description"
                placeholder="Product description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="new-image">Image URL</Label>
              <Input
                id="new-image"
                placeholder="https://picsum.photos/640/480"
                value={form.images[0]}
                onChange={(e) => handleChange("images", [e.target.value])}
              />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={() => {
            if (!form.title.trim()) {
              toast.error("Please enter a product title")
              return
            }
            if (!form.price || form.price <= 0) {
              toast.error("Please enter a valid price")
              return
            }

            if (onAddProduct) {
              onAddProduct({
                title: form.title,
                price: Number(form.price),
                description: form.description || "No description provided",
                categoryId: Number(form.categoryId),
                images: [form.images[0] || "https://picsum.photos/640/480"]
              })
            }
            toast.success("Product created successfully!")
            setForm({
              title: "",
              price: 0,
              description: "",
              categoryId: defaultCategoryId,
              images: ["https://picsum.photos/640/480"],
            })
            setOpen(false)
          }}>
            Create Product
          </Button>
          <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

function TableCellViewer({
  item,
  categories,
  onUpdateProduct
}: {
  item: ProductType
  categories: CategoryType[]
  onUpdateProduct?: (product: Partial<ProductType>) => void
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = React.useState(false)
  const [formData, setFormData] = React.useState(item)

  React.useEffect(() => {
    setFormData(item)
  }, [item])

  const handleChange = (field: keyof ProductType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const currentCategoryId = formData.categoryId ?? formData.category?.id ?? ""

  return (
    <Drawer open={open} onOpenChange={setOpen} swipeDirection={isMobile ? "down" : "right"}>
      <DrawerTrigger
        render={
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground font-medium truncate block"
          />
        }
      >
        {item.title}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.title}</DrawerTitle>
          <DrawerDescription>Edit product details below</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={String(formData.title)}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={String(formData.slug ?? "")}
                onChange={(e) => handleChange("slug", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="category">Category filter</Label>
                <Select
                  value={String(currentCategoryId)}
                  onValueChange={(val) => handleChange("categoryId", Number(val))}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={String(formData.description)}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.images?.[0] || ""}
                onChange={(e) => handleChange("images", [e.target.value])}
              />
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button onClick={() => {
            if (onUpdateProduct) {
              onUpdateProduct(formData)
            }
            toast.success("Changes saved successfully")
            setOpen(false)
          }}>
            Submit
          </Button>
          <DrawerClose render={<Button variant="outline" />}>Done</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}