import Link from "next/link";
import { z } from "zod";
import {
  Calendar,
  CheckSquare,
  BarChart3,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";
import {
  check_if_marked,
  get_day_and_month,
  get_day_name,
  get_day_out_of_year,
  get_first_day_of_year,
  get_number_of_days_in_year,
  get_year_values,
} from "../utils/calendar";
import { HabitDayDropTooltip, YearPicker } from "../components/HabitDisplay";
import { cn } from "../utils/cn";
import { RefObject, useEffect, useRef, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerAuthSession } from "../server/auth";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  return {
    props: { session },
  };
};
export default function HomePage() {
  const session = useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Header session_status={session.status} />
      <main>
        <DemoSection session_status={session.status} />
        <Features />
        <HowItWorks />
        {/* <Testimonials /> */}
        {/* <Pricing /> */}
        <ReadyToJoin session_status={session.status} />
      </main>
      <Footer />
    </div>
  );
}

function Header({
  session_status,
}: {
  session_status: "authenticated" | "loading" | "unauthenticated";
}) {
  return (
    <header className="w-full border-b border-gray-800 px-2 md:px-8">
      <div className="flex h-[5rem] items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            <span className="text-pink-500">STREAK</span>
            <span className="text-white">GRAPH</span>
          </span>
        </div>
        {session_status === "authenticated" && (
          <div className="flex items-center gap-4 md:flex-row">
            <Button
              variant="link"
              onClick={() => void signOut()}
              className="text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              Log Out
            </Button>
            <Link
              href="/habits"
              className="flex items-center rounded bg-pink-500 px-2 py-2 text-sm font-medium text-white hover:bg-pink-600 md:px-3"
            >
              Habits
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
        {session_status === "unauthenticated" && (
          <div className="flex items-center gap-4">
            <Button
              variant="link"
              onClick={() => void signIn()}
              className="text-sm font-medium text-white underline-offset-4 hover:underline"
            >
              Log In
            </Button>
            <Button
              onClick={() => void signIn()}
              className="self-start bg-pink-500 hover:bg-pink-600"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

const DEMO_DATA_LCL_STRG_KEY = "streakgraph-demo-data" as const;
const DemoDataSchema = z.array(
  z.object({
    year: z.number(),
    month: z.number(),
    day: z.number(),
  })
);
type TDemoData = z.infer<typeof DemoDataSchema>;
function get_demo_data_from_lcl_storage() {
  let parsed_data: TDemoData = [];
  const demo_data = localStorage.getItem(DEMO_DATA_LCL_STRG_KEY);
  if (demo_data) {
    const parsed = DemoDataSchema.safeParse(JSON.parse(demo_data));
    if (parsed.success) {
      parsed_data = parsed.data;
    }
  }
  return parsed_data;
}

function DemoSection({
  session_status,
}: {
  session_status: "authenticated" | "loading" | "unauthenticated";
}) {
  const router = useRouter();
  const [demo_data, set_demo_data] = useState<TDemoData>([]);
  useEffect(() => {
    set_demo_data(get_demo_data_from_lcl_storage());
  }, []);

  return (
    <section className="max-w-full px-4 py-12 md:px-8 md:py-24">
      <div className="flex flex-col justify-between gap-6">
        <div className="flex flex-col justify-center gap-3">
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-5xl xl:text-6xl/none">
              Build Better Habits with Visual Progress
            </h1>
            <p className="max-w-[600px] text-gray-400 md:text-xl">
              Track your daily habits with a simple, visual grid. Watch your
              consistency grow with every colored square.
            </p>
          </div>
          <Button
            size="sm"
            className="self-start bg-pink-500 hover:bg-pink-600"
            onClick={() => {
              if (session_status === "authenticated") {
                router.push("/habits");
              } else if (session_status === "unauthenticated") {
                void signIn();
              }
            }}
          >
            Get Started <ChevronRight className="h-2 w-2" />
          </Button>
        </div>
        <HabitDisplayDemo demo_data={demo_data} set_demo_data={set_demo_data} />
      </div>
    </section>
  );
}

function HabitDisplayDemo({
  demo_data,
  set_demo_data,
}: {
  demo_data: TDemoData;
  set_demo_data: (new_data: TDemoData) => void;
}) {
  const today_ref = useRef<HTMLDivElement>(null);
  const [year, set_year] = useState(new Date().getFullYear());
  const total = demo_data.filter((d) => d.year === year).length;

  return (
    <div className="rounded-lg border bg-white p-2 shadow-lg shadow-slate-600 md:p-4">
      <div className="flex justify-between">
        <h1 className="flex justify-start text-xl font-semibold text-slate-700 md:text-2xl lg:text-3xl">
          Reading
        </h1>
        <Button
          className="h-8 rounded bg-pink-500 px-4 text-sm font-semibold text-white hover:bg-pink-600 md:text-base"
          onMouseDown={(e) => {
            e.preventDefault();
            today_ref.current?.dispatchEvent(
              new MouseEvent("mousedown", { bubbles: true })
            );
          }}
          onMouseUp={(e) => {
            e.preventDefault();
            today_ref.current?.dispatchEvent(
              new MouseEvent("mouseup", { bubbles: true })
            );
          }}
        >
          Today
        </Button>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex gap-0">
        <div className="mb-4 mr-2 mt-[-0.25rem] flex flex-col justify-around text-xs lg:mr-4 lg:text-base">
          <p>Sun</p>
          <p>Mon</p>
          <p>Tue</p>
          <p>Wed</p>
          <p>Thu</p>
          <p>Fri</p>
          <p>Sat</p>
        </div>
        <ScrollArea>
          <div className="jason mb-4 gap-[0.15rem] md:gap-[0.2rem] lg:gap-[0.3rem]">
            <HabitSquaresDisplayDemo
              habit_data={demo_data}
              set_demo_data={set_demo_data}
              year={year}
              today_ref={today_ref}
            />
            <ScrollBar orientation="horizontal" />
          </div>
        </ScrollArea>
      </div>
      <div className="h-2 md:h-4" />
      <div className="flex justify-between gap-3">
        <div className="flex gap-2">
          <div
            title="Total"
            className="flex min-w-[2.25rem] items-center justify-center rounded-lg border-2 border-pink-500 px-1 py-0.5 text-sm font-bold text-pink-500 md:min-w-[2.5rem] md:border-2 md:text-xl"
          >
            {total}
          </div>
        </div>
        <YearPicker
          year={year}
          year_values={get_year_values(demo_data)}
          set_year={set_year}
        />
      </div>
    </div>
  );
}

function HabitSquaresDisplayDemo({
  habit_data,
  set_demo_data,
  year,
  today_ref,
}: {
  habit_data: TDemoData;
  set_demo_data: (new_data: TDemoData) => void;
  year: number;
  today_ref: RefObject<HTMLDivElement>;
}) {
  const number_of_days_in_year = get_number_of_days_in_year(year);
  const first_day_of_year = get_first_day_of_year(year);
  const day_out_of_year_for_today =
    new Date().getFullYear() === year
      ? get_day_out_of_year(new Date())
      : new Date().getFullYear() < year
      ? 0
      : number_of_days_in_year;

  useEffect(() => {
    today_ref?.current?.scrollIntoView({ block: "end", inline: "nearest" });
  }, []);
  let output = [];
  for (let i = 1; i < first_day_of_year; i++) {
    output.push(
      <div
        key={i - first_day_of_year}
        className="h-[20px] w-[20px] opacity-0"
      />
    );
  }
  let i = 1;
  for (; i <= day_out_of_year_for_today; i++) {
    const [month, day] = get_day_and_month(i, year);
    if (!month || !day) {
      throw new Error("!month || !day");
    }
    const is_checked = check_if_marked(i, habit_data, year);
    const day_name = get_day_name(year, month, day);
    output.push(
      <HabitDayDropTooltip
        today_ref={i === day_out_of_year_for_today ? today_ref : null}
        key={i}
        color="green-500"
        is_checked={is_checked}
        on_click={() => {
          let new_data = [...habit_data];
          if (is_checked) {
            new_data = new_data.filter((d) => {
              return d.month !== month || d.day !== day || d.year !== year;
            });
          } else {
            new_data.push({
              month,
              day,
              year,
            });
          }
          localStorage.setItem(
            DEMO_DATA_LCL_STRG_KEY,
            JSON.stringify(new_data)
          );
          set_demo_data(new_data);
        }}
        tooltip_content={`${day_name} ${month}-${day}`}
      />
    );
  }
  for (; i <= number_of_days_in_year; i++) {
    output.push(
      <div
        key={i}
        className={cn(
          "h-[20px] w-[20px] rounded-sm border",
          "border-green-500",
          "opacity-30 lg:h-[30px] lg:w-[30px]"
        )}
      ></div>
    );
  }
  return <>{output}</>;
}

function Features() {
  return (
    <section className="w-full bg-[#151926] py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
              Everything you need to build better habits
            </h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our simple yet powerful tools help you track, analyze, and
              maintain your daily habits.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <div className="flex items-center md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
                <CheckSquare className="h-6 w-6" />
              </div>
            </div>
            <div className="w-[90%] md:w-full">
              <h3 className="text-xl font-bold text-white">Visual Tracking</h3>
              <p className="text-gray-400">
                Track your habits with a simple, visual grid. Each completed day
                adds a colored square to your progress.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
                <Calendar className="h-6 w-6" />
              </div>
            </div>
            <div className="w-[90%] md:w-full">
              <h3 className="text-xl font-bold text-white">Multiple Habits</h3>
              <p className="text-gray-400">
                Track as many habits as you want, each with its own color and
                progress grid.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-pink-500">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
            <div className="w-[90%] md:w-full">
              <h3 className="text-xl font-bold text-white">
                Progress Insights
              </h3>
              <p className="text-gray-400">
                Get detailed statistics and insights about your habit
                consistency and streaks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
              Simple steps to build lasting habits
            </h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our approach makes habit building easy, visual, and rewarding.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <div className="flex items-center md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <span className="text-xl font-bold">1</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Create a Habit</h3>
              <p className="text-gray-400">
                Define the habit you want to track and choose a color to
                represent it.
              </p>
            </div>
          </div>
          <div className="flex items-center md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <span className="text-xl font-bold">2</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Track Daily</h3>
              <p className="text-gray-400">
                Mark your habit as complete each day with a single click.
              </p>
            </div>
          </div>
          <div className="flex items-center md:flex-col md:gap-3">
            <div className="w-[10%] min-w-[4rem] md:w-full">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                <span className="text-xl font-bold">3</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">
                Watch Your Progress
              </h3>
              <p className="text-gray-400">
                See your consistency grow with each colored square in your habit
                grid.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section
      id="testimonials"
      className="w-full bg-[#151926] py-12 md:py-24 lg:py-32"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm text-pink-500">
              Testimonials
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              What our users are saying
            </h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join thousands of users who have transformed their habits with
              STREAKGRAPH.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col justify-between rounded-lg border bg-[#1A1E2E] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Award
                    key={i}
                    className="h-5 w-5 fill-current text-pink-500"
                  />
                ))}
              </div>
              <p className="text-gray-400">
                "I've tried many habit trackers, but this is the first one that
                actually helped me stay consistent. The visual grid is so
                satisfying!"
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-full bg-muted p-1">
                <div className="h-8 w-8 rounded-full bg-pink-200" />
              </div>
              <div>
                <p className="text-sm font-medium">Sarah K.</p>
                <p className="text-xs text-gray-400">Meditating for 120 days</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border bg-[#1A1E2E] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Award
                    key={i}
                    className="h-5 w-5 fill-current text-pink-500"
                  />
                ))}
              </div>
              <p className="text-gray-400">
                "The simplicity is what makes it work. I can see my progress at
                a glance, and it motivates me to keep my streaks going."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-full bg-muted p-1">
                <div className="h-8 w-8 rounded-full bg-blue-200" />
              </div>
              <div>
                <p className="text-sm font-medium">Michael T.</p>
                <p className="text-xs text-gray-400">
                  Reading daily for 85 days
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between rounded-lg border bg-[#1A1E2E] p-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Award
                    key={i}
                    className="h-5 w-5 fill-current text-pink-500"
                  />
                ))}
              </div>
              <p className="text-gray-400">
                "I love how I can track multiple habits with different colors.
                It's helped me build a morning routine that sticks."
              </p>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <div className="rounded-full bg-muted p-1">
                <div className="h-8 w-8 rounded-full bg-green-200" />
              </div>
              <div>
                <p className="text-sm font-medium">Jamie L.</p>
                <p className="text-xs text-gray-400">5 habits for 60+ days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm text-pink-500">
              Pricing
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Simple, transparent pricing
            </h2>
            <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Start for free, upgrade when you're ready.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col justify-between rounded-lg border bg-[#1A1E2E] p-6 shadow-sm">
            <div>
              <h3 className="text-2xl font-bold">Free</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$0</span>
                <span className="ml-1 text-gray-400">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Track up to 3 habits</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Basic statistics</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>7-day history</span>
                </li>
              </ul>
            </div>
            <Button
              onClick={() => void signIn()}
              className="mt-6"
              variant="outline"
            >
              Get Started
            </Button>
          </div>
          <div className="relative flex flex-col justify-between overflow-hidden rounded-lg border bg-[#1A1E2E] p-6 shadow-sm">
            <div className="absolute right-0 top-0 bg-pink-500 px-3 py-1 text-xs font-medium text-white">
              Popular
            </div>
            <div>
              <h3 className="text-2xl font-bold">Premium</h3>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-bold">$4.99</span>
                <span className="ml-1 text-gray-400">/month</span>
              </div>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Unlimited habits</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Unlimited history</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Custom colors</span>
                </li>
                <li className="flex items-center">
                  <CheckSquare className="mr-2 h-4 w-4 text-pink-500" />
                  <span>Data export</span>
                </li>
              </ul>
            </div>
            <Button className="mt-6 bg-pink-500 hover:bg-pink-600">
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
function ReadyToJoin({
  session_status,
}: {
  session_status: "authenticated" | "loading" | "unauthenticated";
}) {
  const router = useRouter();
  return (
    <section className="w-full bg-[#1A1E2E] py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-white md:text-4xl/tight">
              Ready to build better habits?
            </h2>
            <p className="max-w-[600px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join those who are transforming their lives one habit at a time.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button
              size="lg"
              className="bg-pink-500 hover:bg-pink-600"
              onClick={() => {
                if (session_status === "authenticated") {
                  router.push("/habits");
                } else if (session_status === "unauthenticated") {
                  void signIn();
                }
              }}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-[#1A1E2E]">
      <div className="container flex flex-col gap-6 px-4 py-8 md:flex-row md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">
              <span className="text-pink-500">STREAK</span>
              <span className="text-white">GRAPH</span>
            </span>
          </div>
          <p className="text-sm text-gray-400">
            Build better habits with visual progress tracking.
          </p>
        </div>
        {/* <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Help
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-400 hover:underline"
                >
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div> */}
      </div>
      {/* <Copyright /> */}
    </footer>
  );
}
function Copyright() {
  return (
    <div className="border-t py-6">
      <div className="container flex flex-col items-center justify-center gap-4 px-4 md:flex-row md:justify-between md:px-6">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} STREAKGRAPH. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-gray-400 hover:text-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            <span className="sr-only">Facebook</span>
          </Link>
          <Link href="#" className="text-gray-400 hover:text-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
            <span className="sr-only">Twitter</span>
          </Link>
          <Link href="#" className="text-gray-400 hover:text-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
            </svg>
            <span className="sr-only">Instagram</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
