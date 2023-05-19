import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const exampleRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getDomain: publicProcedure.query(async ({ ctx }) => {
    // try {
    //   const completion = await openai.createCompletion({
    //     model: "text-davinci-003",
    //     prompt: "Hello world",
    //   });
    //   console.log(completion.data.choices[0]?.text);
    // } catch (error) {
    //   if (error?.response) {
    //     console.log(error.response.status);
    //     console.log(error.response.data);
    //   } else {
    //     console.log(error?.message);
    //   }
    // }
    // const completion = await openai.createCompletion({
    //   model: "text-davinci-003",
    //   prompt: "Hello world",
    // });

    // console.log("openai --->", completion.data);
    // console.log(completion.data.choices[0].text);

    const res = await fetch(`${env.GODADDY_API}/v1/domains/available`, {
      method: "POST",
      body: JSON.stringify(["wupzy.com"]),
      headers: {
        Authorization: `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        "Content-Type": "application/json",
      },
    });

    // TODO: Fetch info from GoDaddy API
    // TODO: Save info to DB
    // TODO: Return info to client

    const data: unknown = await res.json();

    console.log(data);

    return { data: "hello" };
  }),
});
