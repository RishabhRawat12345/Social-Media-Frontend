"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  HomeIcon,
  BellIcon,
  UserIcon,
  PlusCircleIcon,
  MenuIcon,
  XIcon,
  SearchIcon,
} from "lucide-react";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { icon: HomeIcon, label: "Home", path: "/dashboard" },
    { icon: PlusCircleIcon, label: "Create Post", path: "/createpost" },
    { icon: BellIcon, label: "Notifications", path: "/notifications" },
    { icon: UserIcon, label: "Profile", path: "/profile" },
    { icon: SearchIcon, label: "Search Users", path: "/users" },
  ];

  const isActive = (path: string) => pathname === path.toLowerCase();

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-gray-900 text-white p-4 shadow-md">
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          InstaClone
        </h1>
        <Button variant="ghost" className="text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-lg z-50
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:relative md:flex md:flex-col
        `}
      >
        <div className="flex flex-col p-5 justify-between h-full">
          <div>
            <h1
              className="text-3xl font-extrabold mb-8 text-white cursor-pointer hidden md:block"
              onClick={() => router.push("/dashboard")}
            >
              InstaClone
            </h1>

            <ScrollArea className="flex-1">
              <div className="flex flex-col space-y-3">
                {menuItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="ghost"
                    className={`justify-start gap-3 px-4 py-2 rounded-xl text-white font-medium transition-colors duration-200 ${
                      isActive(item.path)
                        ? "bg-gray-800"
                        : "hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      router.push(item.path.toLowerCase());
                      setIsOpen(false);
                    }}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Logout Button */}
          <div className="mt-4">
            <Separator className="mb-4 border-gray-700" />
            <Button
              variant="destructive"
              className="w-full rounded-xl py-2 hover:bg-red-600 transition-colors duration-200 bg-black border border-white"
              onClick={() => {
                localStorage.clear();
                router.push("/login");
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
