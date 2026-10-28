import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "text-foreground",
        verified: "border-green-200 bg-green-100 text-green-800",
        pending: "border-amber-200 bg-amber-100 text-amber-800",
        discrepancy: "border-red-200 bg-red-100 text-red-800",
        disputed: "border-purple-200 bg-purple-100 text-purple-800",
        low: "border-blue-200 bg-blue-100 text-blue-800",
        medium: "border-amber-200 bg-amber-100 text-amber-800",
        high: "border-orange-200 bg-orange-100 text-orange-800",
        critical: "border-red-200 bg-red-100 text-red-800",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
