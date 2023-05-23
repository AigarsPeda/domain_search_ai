import { Configuration, OpenAIApi } from "openai";
import whoiser from "whoiser";
import { z } from "zod";
import { env } from "~/env.mjs";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

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

// "Give me 10 domain names that would be good for company that i described. In language that description is written in. "

const AI_ADDITIONAL_INPUT =
  "Please provide me with 10 domain name suggestions that are suitable for the company described in the provided description and nothing else, written in the same language as the description. Please ensure the suggestions do not contain diacritical or special characters, and any letters with such marks should be replaced with the same letters without the marks. Please ensure the suggestions do not contain any number and are separated by a new line.";

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

        const domainNames = getDomainNames(completion.data.choices[0]?.text);

        const freeDomains: string[] = [];

        for (const domainName of domainNames) {
          const domainInfo = (await whoiser(domainName)) as DomainInfo;

          if (checkIfDomainIsFree(domainInfo)) {
            freeDomains.push(domainName);
            console.log("domainName --->", domainName);
          }
        }

        return { answer: freeDomains };
      } catch (error) {
        const err = error as OpenaiError;
        if (err?.response) {
          console.log(err.response.status);
          console.log(err.response.data);
        } else {
          console.log(err?.message);
        }

        return { answer: "Sorry, I don't know the answer to that." };
      }
    }),
});

const getDomainNames = (str: string | undefined): string[] => {
  if (!str) {
    return [];
  }

  const arr = str.split("\n");

  // remove empty strings
  const filteredArr = arr.filter((item) => item.trim() !== "");

  return filteredArr;
};

interface DomainInfo {
  [key: string]: unknown;
  "Domain Status": string[];
}

// loop through all objects keys in could nested objects and check if they if 'Domain Status': [ 'free' ],
const checkIfDomainIsFree = (obj: DomainInfo): boolean => {
  if (typeof obj === "string" || Array.isArray(obj)) {
    return false;
  }

  if (typeof obj === "object") {
    const keys = Object.keys(obj);

    for (const key of keys) {
      if (key === "Domain Status") {
        const value = obj[key];

        if (
          (Array.isArray(value) && value.includes("free")) ||
          value.length === 0
        ) {
          return true;
        }
      }

      const value = obj[key] as DomainInfo;

      if (value && typeof value === "object") {
        if (checkIfDomainIsFree(value)) {
          return true;
        }
      }
    }
  }

  return false;
};
