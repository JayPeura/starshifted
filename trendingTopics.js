import { reactive } from 'vue';

export const trendingTopics = reactive([]);
export const topics = reactive([]);

export function updateTrendingTopics(newTopics) {
  trendingTopics.splice(0, trendingTopics.length, ...newTopics);
}

export function updateTopics(newTopics) {
  topics.splice(0, topics.length, ...newTopics);
}
