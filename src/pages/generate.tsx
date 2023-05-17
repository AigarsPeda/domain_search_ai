import { type NextPage } from "next";
import { useState } from "react";
import PageHead from "~/components/elements/PageHead";
import Textarea from "~/components/elements/Textarea";

const Generate: NextPage = () => {
  const [textAreaValue, setTextAreaValue] = useState("");

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
      </div>
    </>
  );
};

export default Generate;
