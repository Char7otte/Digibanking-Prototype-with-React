import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

let client: any;
if (!supabaseUrl || !supabaseKey) {
	console.warn(
		"Supabase env vars missing (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY). Using mock supabase client."
	);

	const mockFrom = (_table: string) => {
		const chainable: any = {
			select: async () => ({ data: [], error: null }),
			insert: async (_obj: any) => ({ data: [], error: null }),
			eq() {
				return this;
			},
			gt() {
				return this;
			},
		};
		return chainable;
	};

	client = {
		from: mockFrom,
		auth: {
			signIn: async () => ({ data: null, error: null }),
			signUp: async () => ({ data: null, error: null }),
		},
	} as any;
} else {
	client = createClient(supabaseUrl, supabaseKey);
}

export default client;