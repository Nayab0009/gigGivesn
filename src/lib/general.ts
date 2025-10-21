export const getDuration = (endDate : string) => {
  const start = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - start.getTime();
  const diffHours = diff / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ${Math.floor(diffHours % 24)}h ${Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))}m`;
}