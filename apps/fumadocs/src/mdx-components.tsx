import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { Info, AlertTriangle, CheckCircle2 } from "lucide-react";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    Callout: ({ type = "info", children }: any) => {
      const Icon =
        type === "warning"
          ? AlertTriangle
          : type === "success"
          ? CheckCircle2
          : Info;
      const base = "rounded-md border p-4 my-4 text-sm";
      const cls =
        type === "warning"
          ? `${base} border-yellow-400/40 bg-yellow-400/10`
          : type === "success"
          ? `${base} border-green-400/40 bg-green-400/10`
          : `${base} border-blue-400/40 bg-blue-400/10`;
      return (
        <div className={cls}>
          <div className="mb-1 inline-flex items-center gap-2 font-medium">
            <Icon className="h-4 w-4" />
            {type === "warning"
              ? "Warning"
              : type === "success"
              ? "Success"
              : "Info"}
          </div>
          <div>{children}</div>
        </div>
      );
    },
    ...components,
  };
}
