import { useState } from "react";

const FIELDS = [
  { key: "name", title: "TITLE", sub: "SUBEXPLAIN" },
  { key: "email", title: "TITLE", sub: "SUBEXPLAIN" },
  { key: "message", title: "TITLE", sub: "SUBEXPLAIN" },
];

export default function Contact() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });

  const handleChange = (key) => (e) =>
    setValues((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section className="relative bg-white w-full">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-20 lg:py-[160px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">
        <h2 className="font-bold text-[#292b2f] text-[clamp(28px,4.4vw,64px)]">
          Contact <span className="text-[#4a80f8]">Us</span>
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[660px] lg:ml-auto flex flex-col gap-8 lg:gap-12"
        >
          {FIELDS.map((field) => (
            <div key={field.key} className="flex flex-col gap-2 w-full">
              <p className="font-bold text-[#292b2f] text-[20px]">{field.title}</p>
              <p className="font-normal text-[#555962] text-[14px]">{field.sub}</p>
              <input
                type="text"
                value={values[field.key]}
                onChange={handleChange(field.key)}
                placeholder="Form"
                className="bg-[#f5f5f5] w-full px-4 py-3 font-bold text-[#292b2f] text-[14px] outline-none placeholder:text-[#292b2f] placeholder:opacity-100"
              />
            </div>
          ))}
        </form>
      </div>
    </section>
  );
}
