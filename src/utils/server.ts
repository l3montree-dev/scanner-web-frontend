import { GetServerSidePropsContext } from "next";
import { AuthOptions, unstable_getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ISession } from "../types";

export const getServerSession = (
  req: GetServerSidePropsContext["req"],
  res: GetServerSidePropsContext["res"],
  options: AuthOptions
): Promise<ISession | null> => {
  return unstable_getServerSession(req, res, options);
};
