import createClient from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const useUser = () => {
  const supabase = createClient();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      return user;
    },
  });

  return user;
};

export default useUser;
