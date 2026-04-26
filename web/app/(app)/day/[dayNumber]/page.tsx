"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DayIndex() {
  const params = useParams<{ dayNumber: string }>();
  const router = useRouter();
  useEffect(() => {
    router.replace(`/day/${params.dayNumber}/step/1`);
  }, [params.dayNumber, router]);
  return null;
}
