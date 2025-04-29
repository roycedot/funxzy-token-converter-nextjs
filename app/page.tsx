import { FUN_API_KEY } from "@/app/constants";
import ConversionTable from "@/components/conversion_table";
import { subtitle } from "@/components/primitives";

export default function Home() {
  if (FUN_API_KEY) return <ConversionTable />;

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-center justify-center">
        <div className={subtitle({ class: "mt-4" })}>
          Missing FUN_API_KEY ENV var
        </div>
      </div>

      <div className="flex gap-3">
        Please read the README for setup instructions
      </div>
    </section>
  );
}
