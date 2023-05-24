import { type NextPage } from "next";
import { useState } from "react";
import PageHead from "~/components/elements/PageHead";
import Textarea from "~/components/elements/Textarea";
import { api } from "~/utils/api";

const Generate: NextPage = () => {
  const [textAreaValue, setTextAreaValue] = useState("");
  const { mutate, data } = api.example.askQuestion.useMutation();

  return (
    <>
      <PageHead
        title="AI Domain search | Generate"
        descriptionShort="Unlock AI-Powered Domain Recommendations!"
        descriptionLong="Unlock AI-Powered Domain Recommendations! Describe your business or
            project below and let our advanced AI technology generate
            personalized domain name suggestions exclusively for you. Take your
            online presence to the next level!"
      />
      <div className="min-h-screen">
        <Textarea
          value={textAreaValue}
          handleInputChange={setTextAreaValue}
          placeholder="Describe your business or project..."
        />
        <button
          className="rounded-md border-2 border-pink-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-pink-500"
          onClick={() =>
            mutate({
              question: textAreaValue,
            })
          }
        >
          Generate
        </button>

        {data && (
          <div className="mt-10">
            {/* <h1 className="text-xl font-extrabold tracking-tight text-gray-50 sm:text-[2rem] md:text-6xl">
              {data.answer}
            </h1> */}

            {data.answer.map((item) => (
              <div className="flex flex-col items-center gap-2" key={item}>
                <p className="text-2xl text-white">{item}</p>
              </div>
            ))}

            {/* <p className="mb-10 mt-6 text-gray-50">{data.answer}</p> */}
          </div>
        )}
      </div>
    </>
  );
};

export default Generate;
