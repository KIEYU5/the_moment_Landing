export default function Footer() {
  return (
    <footer className="relative bg-[#fbfbfb] w-full">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20 py-16 sm:py-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
        <div>
          <p className="font-bold text-[#292b2f] text-[26px] sm:text-[32px] lg:text-[36px]">
            THE MOMENT
          </p>
          <p className="font-bold text-[#555962] text-[18px] sm:text-[22px] lg:text-[24px] mt-4">
            A development partner innovating the moment.
          </p>
          <p className="font-normal text-[#555962] text-[14px] mt-12 lg:mt-[152px]">
            © 2026 the_moment. All rights reserved.
          </p>
        </div>

        <div className="flex gap-16 sm:gap-20">
          <div className="flex flex-col gap-6 sm:gap-20">
            <p className="font-normal text-[#555962] text-[14px]">SOCIAL</p>
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="font-bold text-[#292b2f] text-[18px] sm:text-[20px]">
                Instagram
              </p>
              <p className="font-bold text-[#292b2f] text-[18px] sm:text-[20px]">
                Instagram
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 sm:gap-20">
            <p className="font-normal text-[#555962] text-[14px]">LEGAL</p>
            <p className="font-bold text-[#292b2f] text-[18px] sm:text-[20px]">
              Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
