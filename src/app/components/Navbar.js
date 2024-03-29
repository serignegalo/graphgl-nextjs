"use client";

import React from "react";
import Image from "next/image";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaGitAlt } from "react-icons/fa";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { RiLogoutCircleRLine } from "react-icons/ri";
import Link from "next/link";

export default function Navbar() {
  function disconnect() {
    localStorage.removeItem("token");
    // window.location.href = "http://localhost:3000/";
    return;
  }
  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-row mx-[2vw]">
        <Image
          src="/logo.png"
          alt="Vercel Logo"
          className="dark:invert"
          width={75}
          height={24}
          priority
        />
        <p className="text-sm ml-8">
          <span className="mx-[1vw]">INTRA</span> {">"}{" "}
          <span className="mx-[1vw]">DAKAR</span> {">"}{" "}
          <span className="mx-[1vw]">PROFIL</span>{" "}
        </p>
      </div>
      <div className="flex items-center">
        <div className="flex flex-row items-center mx-4 text-red-400 border-r-2 border-gray-300">
          <FaRegCalendarAlt size="20" className="mx-[1vw]" />
          <p className="mr-10">2</p>
        </div>
        <div className="flex items-center ml-[2vw]">
          <FaGitAlt size="20" />
          <div className="flex items-center mx-[2vw]">
            <HiOutlineSquares2X2 size="20" />
            <p className="mx-[1vw]">Galo Diokhane</p>
            <Link href="/">
              <div
                className="cursor-pointer hover:text-red-400 rounded"
                onClick={disconnect}
              >
                <RiLogoutCircleRLine />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
