"use client"

import { Table } from "@tanstack/react-table"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { DataTableFacetedFilter } from "./data-table-faceted-filter"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
}

export function DataTableToolbar<TData>({
    table,
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    const statusColumn = table.getColumn("status")

    const statusOptions = [
        { label: "Active", value: "Active" },
        { label: "Repair", value: "Repair" },
        { label: "Disposed", value: "Disposed" },
        { label: "Spare", value: "Spare" },
        { label: "Backup", value: "Backup" },
    ]

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Search all columns..."
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={(event) => table.setGlobalFilter(event.target.value)}
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {statusColumn && (
                    <DataTableFacetedFilter
                        column={statusColumn}
                        title="Status"
                        options={statusOptions}
                    />
                )}
                {table.getColumn("section") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("section")}
                        title="Section"
                        options={Array.from(table.getColumn("section")?.getFacetedUniqueValues()?.keys() || [])
                            .filter(Boolean)
                            .map((value) => ({ label: String(value), value: String(value) }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                    />
                )}
                {table.getColumn("center") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("center")}
                        title="Center"
                        options={Array.from(table.getColumn("center")?.getFacetedUniqueValues()?.keys() || [])
                            .filter(Boolean)
                            .map((value) => ({ label: String(value), value: String(value) }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                    />
                )}
                {table.getColumn("station") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("station")}
                        title="Station"
                        options={Array.from(table.getColumn("station")?.getFacetedUniqueValues()?.keys() || [])
                            .filter(Boolean)
                            .map((value) => ({ label: String(value), value: String(value) }))
                            .sort((a, b) => a.label.localeCompare(b.label))}
                    />
                )}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    )
}
