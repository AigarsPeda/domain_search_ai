import { Configuration, OpenAIApi } from "openai";
import whoiser, { type WhoisSearchResult } from "whoiser";
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

// domainbrain.net
// domainsmart.net
// seekai.com
// nameintel.com
// seekai.com

const INTRO = "Provide 10 domain with top level domain name suggestions for: ";
const RULES =
  ". No explanation. Language description language. No number. Separated by a new line. No diacritical or special characters, and any letters with such marks should be replaced with the same letters without the marks";

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
          prompt: `${INTRO} - ${input.question} - ${RULES}`,
        });

        console.log("completion.data", completion.data);

        const domainNames = getDomainNames(completion.data.choices[0]?.text);

        console.log("domainNames ????", domainNames);

        const freeDomains: string[] = [];

        for (const domainName of domainNames) {
          const domainInfo = await whoiser(domainName);

          if (checkIfDomainIsFree(domainInfo)) {
            freeDomains.push(domainName);
          }
        }

        // const res = await fetch(`${env.GODADDY_API}/v1/domains/available`, {
        //   method: "POST",
        //   body: JSON.stringify(domainNames),
        //   headers: {
        //     Authorization: `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        //     "Content-Type": "application/json",
        //   },
        // });

        // const data: unknown = await res.json();
        // console.log("data --->", data);

        return { answer: freeDomains };
      } catch (error) {
        const err = error as OpenaiError;
        if (err?.response) {
          console.log(err.response.status);
          console.log(err.response.data);
        } else {
          console.log(err?.message);
        }

        return { answer: ["Sorry, I don't know the answer to that."] };
      }
    }),
});

// remove everything before first :'
const removeEverythingBeforeFirstColon = (str: string): string => {
  const index = str.indexOf(":");
  return str.slice(index + 1);
};

const getDomainNames = (str: string | undefined): string[] => {
  if (!str) {
    return [];
  }

  const arr = removeEverythingBeforeFirstColon(str).split("\n");

  // remove empty strings or strings that are just one character long
  const filteredArr = arr.filter((item) => {
    const domainName = item.trim().replace(/\s/g, "");
    if (domainName !== "" && domainName.length > 1) {
      return domainName;
    }
  });

  return filteredArr;
};

// loop through all objects keys in could nested objects and check if they if 'Domain Status': [ 'free' ],
const checkIfDomainIsFree = (obj: WhoisSearchResult): boolean => {
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
          (value && value.length === 0)
        ) {
          return true;
        }
      }

      const value = obj[key] as WhoisSearchResult;

      if (value && typeof value === "object") {
        if (checkIfDomainIsFree(value)) {
          return true;
        }
      }
    }
  }

  return false;
};
