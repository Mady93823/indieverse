"use client";

import { useState } from "react";
import { RotateCcwIcon } from "lucide-react";
import { Field } from "@/components/admin/form-parts";
import { PageBody } from "@/components/site/page-body";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { fillTokens } from "@/lib/pages/defaults";

/** The page text with Write and Preview tabs, and a way back to the starter template. */
export function PageEditor({
  defaultBody,
  template,
  tokens,
}: {
  defaultBody: string;
  template: string;
  tokens: { site: string; email: string; url: string };
}) {
  const [body, setBody] = useState(defaultBody);

  return (
    <Tabs defaultValue="write" className="gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <TabsList>
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        {body !== template && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={(event) => {
              if (!window.confirm("Replace the text with the starter template? Your changes here will be lost.")) return;
              setBody(template);
              // Count it as an edit for the unsaved-changes warning.
              event.currentTarget.form?.dispatchEvent(new Event("input", { bubbles: true }));
            }}
          >
            <RotateCcwIcon data-icon="inline-start" aria-hidden />
            Use the starter template
          </Button>
        )}
      </div>
      {/* forceMount keeps the textarea in the form while the preview is shown. */}
      <TabsContent value="write" forceMount className="data-[state=inactive]:hidden">
        <Field
          name="body"
          label="Text"
          className="[&>label]:sr-only"
          hint={
            <>
              Start a line with <code>## </code> for a heading and <code>- </code> for a list item. Leave an empty line
              between paragraphs. Links and email addresses become clickable. <code>{"{site}"}</code> and{" "}
              <code>{"{email}"}</code> are replaced with your site name and contact email.
            </>
          }
        >
          <Textarea
            id="body"
            name="body"
            rows={22}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono text-sm leading-relaxed"
          />
        </Field>
      </TabsContent>
      <TabsContent value="preview" className="rounded-lg border p-4 sm:p-6">
        <PageBody body={fillTokens(body, tokens)} />
      </TabsContent>
    </Tabs>
  );
}
