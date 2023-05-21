import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";

type OpenaiError = {
  code: number;
  message: string;
  requestId: string;
  details: unknown;
  response: {
    status: number;
    data: unknown;
  };
};

const AI_ADDITIONAL_INPUT =
  "Give me 10 domain names that matches my description that i provided and nothing else in language that description is written in.";

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

    return { data };
  }),

  askQuestion: publicProcedure
    .input(z.object({ question: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const completion = await openai.createCompletion({
          n: 1,
          top_p: 1,
          max_tokens: 500,
          presence_penalty: 0,
          frequency_penalty: 0,
          model: "text-davinci-003",
          prompt: `Q: ${input.question} - ${AI_ADDITIONAL_INPUT}\nA:`,
        });

        console.log("completion.data.choices --->", completion.data.choices);

        return { answer: completion.data.choices[0]?.text };
      } catch (error) {
        const err = error as OpenaiError;
        if (err?.response) {
          console.log(err.response.status);
          console.log(err.response.data);
        } else {
          console.log(err?.message);
        }

        return { answer: "Sorry, I don't know the answer to that." };

        // return { answer: completion.data.choices[0].text };
      }
    }),

  // console.log("openai --->", completion.data);
});
