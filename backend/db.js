const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to Supabase database');

const query = async (text, params) => {
    try {
        const { data, error } = await supabase.rpc('execute_sql', {
            query_text: text,
            query_params: params
        });
        
        if (error) throw error;
        return { rows: data };
    } catch (error) {
        console.error('Query error:', error);
        throw error;
    }
};

const getClient = () => {
    return {
        query: query,
        release: () => {}
    };
};

module.exports = {
    query,
    getClient,
    supabase
};
