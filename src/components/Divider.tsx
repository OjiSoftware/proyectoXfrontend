import clsx from "clsx"
import React from "react"

type DividerProps = React.ComponentPropsWithoutRef<"hr"> & {
    soft?: boolean
}

export function Divider({ className, soft = false, ...props }: DividerProps) {
    return (
        <hr
            role="presentation"
            {...props}
            className={clsx(
                "w-full border-0 border-t",

                soft
                    ? "border-white/30 dark:border-white/20"
                    : "border-white/70 dark:border-white/60",

                "my-6",
                className
            )}
        />
    )
}
