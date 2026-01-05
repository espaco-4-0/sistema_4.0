"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Root>>
) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Trigger>>
) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Portal>>
) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Close>>
) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: Readonly<React.ComponentProps<typeof DialogPrimitive.Overlay>>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: Readonly<
  React.ComponentProps<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
  }
>) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background fixed top-1/2 left-1/2 z-50 grid w-full",
          "translate-x-[-50%] translate-y-[-50%]",
          "gap-4 rounded-lg border p-6 shadow-lg outline-none",
          "data-[state=open]:animate-in data-[state=open]:zoom-in-95",
          "max-w-[calc(100%-2rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto",
          className
        )}
        {...props}
      >
        {children}

        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute right-4 top-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader(
  props: Readonly<React.ComponentProps<"div">>
) {
  return (
    <div
      data-slot="dialog-header"
      className="flex flex-col gap-2 text-center sm:text-left"
      {...props}
    />
  )
}

function DialogFooter(
  props: Readonly<React.ComponentProps<"div">>
) {
  return (
    <div
      data-slot="dialog-footer"
      className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      {...props}
    />
  )
}

function DialogTitle(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Title>>
) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className="text-lg font-semibold leading-none"
      {...props}
    />
  )
}

function DialogDescription(
  props: Readonly<React.ComponentProps<typeof DialogPrimitive.Description>>
) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className="text-sm text-muted-foreground"
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
