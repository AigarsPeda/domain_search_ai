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

// "Give me 10 domain names that would be good for company that i described. In language that description is written in. "

const AI_ADDITIONAL_INPUT =
  "Please provide me with 10 domain name suggestions that are suitable for the company described in the provided description, written in the same language as the description.";

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

        // const res = await fetch(`${env.GODADDY_API}/v1/domains/available`, {
        //   method: "POST",
        //   // body: JSON.stringify(["kakisuni.com"]),
        //   body: JSON.stringify(domainNames),
        //   headers: {
        //     Authorization: `sso-key ${env.GODADDY_API_KEY}:${env.GODADDY_API_SECRET}`,
        //     "Content-Type": "application/json",
        //   },
        // });

        const res = await fetch(
          "https://domain-availability.whoisxmlapi.com/api/v1?apiKey=at_5eEUW7cAPFdCOC80hAUbeljpXocZG&domainName=google.com&credits=DA"
        );

        // https://domain-availability.whoisxmlapi.com/api/v1?apiKey=at_5eEUW7cAPFdCOC80hAUbeljpXocZG&domainName=google.com&credits=DA

        const data: unknown = await res.json();
        console.log("data -->", data);

        // console.log("---->", getDomainNames(completion.data.choices[0]?.text));

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

// text: '\n' +
// '1. SuņiKaķiTārpi.lv\n' +
// '2. AnimalLove.lv\n' +
// '3. FourLegs.lv\n' +
// '4. SnakesCatsDogs.lv\n' +
// '5. Playmates.lv\n' +
// '6. AnimalFamily.lv\n' +
// '7. CreatureNation.lv\n' +
// '8. CritterCentral.lv\n' +
// '9. WoollyNeeds.lv\n' +
// '10. PetsAreUs.lv',

const getDomainNames = (str: string | undefined): string[] => {
  if (!str) {
    return [];
  }

  const arr = str.split("\n");

  const modifiedList = arr.map((item) => item.replace(/^\d+\.\s/, ""));

  // remove 1. 2. 3. etc
  // const newArr = arr
  //   .map((item) => {
  //     return item.replace(/\d+\./, "").trim();
  //   })
  //   .filter((item) => item.includes(" "));

  return modifiedList;
};
