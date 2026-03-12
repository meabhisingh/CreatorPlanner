export const getPublicUrl = (key: string) => {
  if (key.startsWith("http")) return key;

  return `${process.env.NEXT_PUBLIC_BUCKET_URL}/${key}`;
};

export const BUCKET_NAME = "creator-planner";
