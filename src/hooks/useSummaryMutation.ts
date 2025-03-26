import { useMutation, useQueryClient } from "@tanstack/react-query";

const useSummaryMutation = () => {
  const queryClient = useQueryClient();

  const mutationFn = async ({
    userId,
    summaryId,
  }: {
    userId: string;
    summaryId: string;
  }) => {
    // use the current route we have.
    try {
      const response = await fetch(`api/summaries/${summaryId}`, {
        method: "PATCH",
        headers: {
          "X-User-Id": userId,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark summary as listened");
      }
    } catch (error) {
      throw error;
    }
  };

  // after the mutation is successful, we need to invalidate the summaries query.
  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["summaries"] });
  };

  return useMutation({ mutationFn, onSuccess: handleSuccess });
};

export default useSummaryMutation;
