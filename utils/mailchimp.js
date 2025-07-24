import client from '@mailchimp/mailchimp_marketing'

const config = {};
const initMailchimp = () => {
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX || !process.env.MAILCHIMP_AUDIENCE_ID) {
        console.error('MAILCHIMP environment variables are not set.');
        process.exit(1);
    }
    client.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX
    });
    config.audienceId = process.env.MAILCHIMP_AUDIENCE_ID;
}

const addSubscriber = async (email, firstName) => {
    const response = await client.lists.setListMember(
    config.audienceId,
    email,
    { 
        email_address: email, 
        status_if_new: "subscribed",
        status: "subscribed",
        merge_fields: {
            FNAME: firstName
        }
    }
  );
  console.log(response);
}

export { initMailchimp, addSubscriber };
