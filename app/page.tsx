"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  SignInButton,
  SignUpButton,
  SignedOut,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div className="min-h-screen relative">
      {/* Full-width gradient background with diagonal slant */}
      <div className="absolute top-0 left-0 right-0 h-[70vh] bg-gradient-to-br from-[#51B6A2] via-[#29AE78] to-[#0C2E24] -z-10">
        {/* Diagonal slant overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-[16.2rem] bg-white transform -skew-y-3 translate-y-16"></div>
      </div>

      {/* Content Area */}
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto py-6 px-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-black">InvestSmart AI</div>
          {isMobile ? (
            <>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-black"
              >
                <Menu size={24} />
              </button>
              {mobileMenuOpen && (
                <div className="absolute top-20 right-6 bg-white shadow-lg rounded-lg p-4 z-50 flex flex-col gap-2 w-[200px]">
                  <SignedOut>
                    <Button asChild variant="ghost" className="justify-start">
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                  </SignedOut>
                  <SignedOut>
                    <Button asChild variant="default" className="justify-start">
                      <Link href="/sign-up">Get Started</Link>
                    </Button>
                  </SignedOut>
                  <SignedIn>
                    <Button asChild variant="outline" className="justify-start">
                      <Link href="/dashboard">Dashboard</Link>
                    </Button>
                    <div className="py-2">
                      <UserButton showName />
                    </div>
                  </SignedIn>
                </div>
              )}
            </>
          ) : (
            <nav className="flex items-center gap-4">
              <SignedOut>
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
              <SignedOut>
                <Button asChild variant="default">
                  <Link href="/sign-up">Get Started</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton showName />
              </SignedIn>
            </nav>
          )}
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 pt-20 pb-36 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1
              className={`${
                isMobile ? "text-4xl" : "text-6xl"
              } font-bold text-black leading-tight`}
            >
              Smart Investment
              <br />
              Guidance Powered
              <br />
              by AI
            </h1>
            <p className="mt-4 text-lg text-black/80 max-w-md">
              Get personalized investment recommendations based on your goals,
              risk tolerance, and financial situation.
            </p>
            <div className="mt-8 flex gap-4">
              <SignedOut>
                <Button asChild size="lg">
                  <Link href="/questionnaire">
                    Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </SignedOut>
              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          {isMobile ? (
            <></>
          ) : (
            <div className={`relative ${isMobile ? "mt-8" : ""}`}>
              <div
                className={`bg-white/30 rounded-lg shadow-xl overflow-hidden ${
                  isMobile ? "w-full h-[400px]" : "w-[900px] h-[650px]"
                }`}
              >
                {/* Dashboard Header */}

                {/* Dashboard Sidebar */}
                <div className={`flex h-full ${isMobile ? "flex-col" : ""}`}>
                  <div
                    className={`${
                      isMobile ? "w-full h-auto" : "w-40"
                    } bg-[#D0F9ED] p-2 space-y-1`}
                  >
                    <div className="p-4 border-b flex items-center gap-2">
                      <div className="h-5 w-5 bg-white rounded-full"></div>
                      <span className="font-medium text-sm">anish_j1</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="ml-1"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M6 9L12 15L18 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="px-3 py-2 rounded-md bg-[#51B6A2]/20 text-[#29AE78] flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8 13v-1m4 1v-3m4 3V8M12 21a9 9 0 110-18 9 9 0 010 18z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">Portfolio</span>
                    </div>

                    <div className="px-3 py-2 rounded-md flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">Market</span>
                    </div>

                    <div className="px-3 py-2 rounded-md flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">Assistant</span>
                    </div>

                    <div className="px-3 py-2 rounded-md flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">Learning</span>
                    </div>

                    <div className="px-3 py-2 rounded-md flex items-center gap-2">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="text-sm">News</span>
                    </div>
                  </div>

                  {/* Dashboard Main Content */}
                  <div className="flex-1 p-4">
                    <div
                      className={`${
                        isMobile ? "w-full" : "ml-auto"
                      } relative mb-5 mt-5`}
                    >
                      <input
                        type="text"
                        placeholder="Search"
                        className={`pl-8 pr-4 py-1 text-sm border-gray border rounded-md ${
                          isMobile ? "w-full" : "w-[400px]"
                        } bg-white`}
                        disabled
                      />
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        className="absolute left-2 top-1.5"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div
                      className={`bg-white/90 rounded-md border p-5 mb-5 ${
                        isMobile ? "flex flex-col" : "flex flex-row"
                      }`}
                    >
                      {/* Portfolio Value */}
                      <div className="mb-4 mr-16">
                        <h2 className="text-lg font-medium text-black">
                          Total Portfolio Value
                        </h2>
                        <div className="flex items-baseline mb-2">
                          <span className="text-2xl font-bold">$4545.39</span>
                          <span className="ml-2 text-green-500 text-xs">
                            +5.64%
                          </span>
                        </div>

                        {/* Performance Chart */}
                        <div className="bg-white/50 rounded-md border p-2">
                          <div className="h-40">
                            <svg
                              viewBox="0 0 400 80"
                              className="w-full h-full overflow-visible"
                            >
                              <path
                                d="M0,80 L20,75 L40,78 L60,76 L80,72 L100,65 L120,68 L140,62 L160,58 L180,50 L200,40 L220,42 L240,38 L260,30 L280,20 L300,18 L320,15 L340,12 L360,8 L380,5 L400,2"
                                fill="none"
                                stroke="#29AE78"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Asset Allocation */}
                      <div
                        className={`bg-white/50 rounded-md ${
                          isMobile ? "w-full mt-4" : "w-[400px]"
                        } border p-10`}
                      >
                        <div className="mb-1">
                          <h3 className="text-base font-medium">
                            Asset Allocation
                          </h3>
                          <p className="text-xs text-gray-500">
                            How your investments are distributed
                          </p>
                        </div>
                        <div className="flex items-center flex-col">
                          <div className="h-20 w-20 mb-4">
                            <svg
                              viewBox="0 0 100 100"
                              className="w-full h-full"
                            >
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="20"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#818cf8"
                                strokeWidth="20"
                                strokeDasharray="188.5 251.3"
                                strokeDashoffset="0"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#29AE78"
                                strokeWidth="20"
                                strokeDasharray="62.8 377"
                                strokeDashoffset="-188.5"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#fbbf24"
                                strokeWidth="20"
                                strokeDasharray="31.4 408.4"
                                strokeDashoffset="-251.3"
                              />
                            </svg>
                          </div>
                          <div className="text-xs flex flex-row">
                            <div className="flex items-center mr-2">
                              <div className="h-[10px] w-[13px] bg-indigo-400 rounded-full mr-1"></div>
                              <span>Stocks 60%</span>
                            </div>
                            <div className="flex items-center mr-2">
                              <div className="h-[10px] w-[13px] bg-[#29AE78] rounded-full mr-1"></div>
                              <span>Bonds 20%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Cards */}
                    <div
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "grid-cols-2"
                      } gap-4`}
                    >
                      {/* Your Assets */}
                      <div className="bg-white/50 rounded-md border p-4">
                        <h3 className="text-lg font-medium mb-2">
                          Your Assets
                        </h3>
                        {/* Asset Item */}
                        <div
                          className={`${
                            isMobile
                              ? "flex flex-col gap-2 border-b pb-2 mb-2"
                              : "flex items-center justify-between"
                          } py-1 text-xs`}
                        >
                          <div className="flex flex-col">
                            <div className="font-medium">AMD</div>
                            <div className="text-gray-500">
                              Advanced Micro Devi...
                            </div>
                          </div>
                          <div
                            className={`${
                              isMobile
                                ? "flex justify-between"
                                : "flex items-center gap-2"
                            }`}
                          >
                            <div className="h-6 w-12 bg-gray-100 rounded-sm">
                              <svg
                                viewBox="0 0 48 24"
                                className="w-full h-full"
                              >
                                <path
                                  d="M2,22 L8,18 L14,20 L20,16 L26,14 L32,10 L38,8 L44,6"
                                  fill="none"
                                  stroke="#29AE78"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Shares</div>
                              <div className="text-gray-500">10</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Value</div>
                              <div className="text-gray-500">$209.51</div>
                            </div>
                          </div>
                        </div>

                        {/* Asset Item */}
                        <div
                          className={`${
                            isMobile
                              ? "flex flex-col gap-2 border-b pb-2 mb-2"
                              : "flex items-center justify-between"
                          } py-1 text-xs`}
                        >
                          <div className="flex flex-col">
                            <div className="font-medium">AAPL</div>
                            <div className="text-gray-500">Apple Inc.</div>
                          </div>
                          <div
                            className={`${
                              isMobile
                                ? "flex justify-between"
                                : "flex items-center gap-2"
                            }`}
                          >
                            <div className="h-6 w-12 bg-gray-100 rounded-sm">
                              <svg
                                viewBox="0 0 48 24"
                                className="w-full h-full"
                              >
                                <path
                                  d="M2,22 L8,18 L14,20 L20,16 L26,14 L32,10 L38,8 L44,6"
                                  fill="none"
                                  stroke="#29AE78"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Shares</div>
                              <div className="text-gray-500">10</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Value</div>
                              <div className="text-gray-500">$209.51</div>
                            </div>
                          </div>
                        </div>

                        {/* Asset Item */}
                        <div
                          className={`${
                            isMobile
                              ? "flex flex-col gap-2"
                              : "flex items-center justify-between"
                          } py-1 text-xs`}
                        >
                          <div className="flex flex-col">
                            <div className="font-medium">MSFT</div>
                            <div className="text-gray-500">
                              Microsoft Corporation
                            </div>
                          </div>
                          <div
                            className={`${
                              isMobile
                                ? "flex justify-between"
                                : "flex items-center gap-2"
                            }`}
                          >
                            <div className="h-6 w-12 bg-gray-100 rounded-sm">
                              <svg
                                viewBox="0 0 48 24"
                                className="w-full h-full"
                              >
                                <path
                                  d="M2,22 L8,18 L14,20 L20,16 L26,14 L32,10 L38,8 L44,6"
                                  fill="none"
                                  stroke="#29AE78"
                                  strokeWidth="1.5"
                                />
                              </svg>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Shares</div>
                              <div className="text-gray-500">10</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="font-medium">Value</div>
                              <div className="text-gray-500">$209.51</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* AI Suggestions */}
                      <div className="bg-white/50 rounded-md border p-5">
                        <h3 className="text-lg font-medium mb-2">
                          AI Suggestions
                        </h3>
                        <p className="text-xs mb-3">
                          Your current portfolio is heavily weighted in stocks.
                          Consider adding bonds for better diversification.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full h-8 mt-10 text-xs border-[#29AE78] text-[#29AE78] pointer-events:none"
                        >
                          View Detailed Recommendations
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* White Bottom Section (Similar to Stripe's layout) */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform guides you through every step of your
              investment journey, providing personalized recommendations based
              on your unique financial profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#51B6A2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#29AE78]">1</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Answer Questions</h3>
              <p className="text-gray-600">
                Complete our dynamic questionnaire to assess your risk
                tolerance, goals, and financial situation.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#51B6A2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#29AE78]">2</span>
              </div>
              <h3 className="text-xl font-medium mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes your responses to create a personalized
                investment profile and recommendations.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#51B6A2]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-[#29AE78]">3</span>
              </div>
              <h3 className="text-xl font-medium mb-2">Get Guidance</h3>
              <p className="text-gray-600">
                Receive tailored investment advice and ask follow-up questions
                through our AI chat interface.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Key Features Section */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Key Features</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to make informed investment decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="border rounded-lg p-6">
              <div className="mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">
                Personalized Guidance
              </h3>
              <p className="text-gray-600">
                Tailored investment advice based on your unique profile
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 20V10M12 20V4M6 20v-6"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Visual Dashboard</h3>
              <p className="text-gray-600">
                Interactive charts to visualize your recommended asset
                allocation
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <div className="mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"
                    stroke="#000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">AI Chat Assistant</h3>
              <p className="text-gray-600">
                Ask follow-up questions and get real-time answers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0C2E24] text-white py-12">
        <div className="container mx-auto px-6">
          <div
            className={`${
              isMobile
                ? "flex flex-col gap-8"
                : "flex justify-between items-center"
            }`}
          >
            <div>
              <h3 className="text-xl font-bold mb-2">InvestSmart AI</h3>
              <p className="text-white/60">
                Intelligent investment guidance for everyone
              </p>
            </div>

            <div
              className={`${
                isMobile ? "grid grid-cols-2 gap-6" : "flex gap-8"
              }`}
            >
              <div>
                <h4 className="font-medium mb-3">Product</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <Link href="#" className="hover:text-white">
                      Features
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Company</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <Link href="#" className="hover:text-white">
                      About
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-3">Legal</h4>
                <ul className="space-y-2 text-white/60">
                  <li>
                    <Link href="#" className="hover:text-white">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className={`mt-12 pt-6 border-t border-white/10 ${
              isMobile
                ? "flex flex-col gap-4"
                : "flex justify-between items-center"
            }`}
          >
            <p className="text-white/60 text-sm">
              &copy; {new Date().getFullYear()} InvestSmart AI. All rights
              reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-white/60 hover:text-white">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 9h4v12H2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="4"
                    cy="4"
                    r="2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
