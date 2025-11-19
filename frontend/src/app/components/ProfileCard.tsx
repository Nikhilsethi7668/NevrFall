"use client";

export default function ProfileCard() {
  const userName = localStorage.getItem("userName");

  return (
    <div className="flex justify-center py-10">
      <div className="relative">
        {/* Avatar Display */}
        <div className="flex items-center gap-2 rounded-xl bg-base-100 px-3 py-2 shadow-md">
          <div className="relative h-10 w-10">
            <div className="h-full w-full rounded-full bg-primary flex items-center justify-center text-white object-cover">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></span>
          </div>
          <span className="text-sm font-medium text-base-content">
            {userName}
          </span>
        </div>
      </div>
    </div>
  );
}