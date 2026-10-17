import { JsonLd } from "@/components/json-ld";
import { FAQS } from "@/lib/site";

/**
 * Questions grown-ups ask, as open-and-close cards. The same answers go out
 * as FAQPage structured data, which must match what is visible on the page.
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="planks px-4 py-16">
      <h2 id="faq-heading" className="heading-pop mb-10 text-center text-5xl font-semibold">
        Questions from grown-ups
      </h2>
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {FAQS.map((f) => (
          <details key={f.q} className="card-game group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xl font-semibold">
              {f.q}
              <span aria-hidden="true" className="text-2xl text-peppa-red-ink transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-lg">{f.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
    </section>
  );
}
