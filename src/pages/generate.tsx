import { type NextPage } from "next";
import { useState } from "react";
import Button from "~/components/elements/Button/Button";
import PageHead from "~/components/elements/PageHead";
import Textarea from "~/components/elements/Textarea";
import { api } from "~/utils/api";

const Generate: NextPage = () => {
  const [textAreaValue, setTextAreaValue] = useState("");
  const { data, mutate, isLoading } = api.example.askQuestion.useMutation();

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
        <Button
          isLoading={isLoading}
          btnTitle="Get started"
          handleClick={() => {
            mutate({
              question: textAreaValue,
            });
          }}
        />

        {data && (
          <div className="mt-10">
            {data.answer.map((item) => (
              <div className="flex flex-col items-center gap-2" key={item}>
                <p className="text-2xl text-white">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Generate;
