import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { decorate } from "../../decorators/decorate";
import { withDB } from "../../decorators/withDB";
import BadRequestException from "../../errors/BadRequestException";
import MethodNotAllowed from "../../errors/MethodNotAllowed";
import { emailRegex } from "../../utils/common";

const handlePost = async (
  req: NextApiRequest,

  prisma: PrismaClient
) => {
  const { email } = req.body;
  if (!emailRegex.test(email)) {
    throw new BadRequestException();
  }

  await prisma.email.upsert({
    where: {
      email,
    },
    create: {
      email,
    },
    update: {
      email,
    },
  });

  return {
    success: true,
  };
};

export default decorate(
  async (req: NextApiRequest, _res: NextApiResponse, [prisma]) => {
    switch (req.method) {
      case "POST":
        return handlePost(req, prisma);
      default:
        throw new MethodNotAllowed();
    }
  },
  withDB
);
