import mailchimp from '@mailchimp/mailchimp_marketing'

const initMailchimp = () => {
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_SERVER_PREFIX) {
        console.error('MAILCHIMP environment variables are not set.');
        process.exit(1);
    }
    mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX
    });
}

const healthCheck = async () => {
    const response = await mailchimp.ping.get();
    return response;
}

export { initMailchimp, healthCheck };
