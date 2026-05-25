const { buildTrustAnalysis, buildRecommendations } = require('./aiFallback');

const getAiEngineUrl = () => process.env.AI_ENGINE_URL?.replace(/\/$/, '');

const postJSON = async (path, payload) => {
  const aiEngineUrl = getAiEngineUrl();
  if (!aiEngineUrl) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${aiEngineUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const getTrustAnalysis = async (payload) => {
  const remote = await postJSON('/trust-score', payload);
  if (remote?.analysis) return remote;

  return {
    source: 'embedded-ai-fallback',
    analysis: buildTrustAnalysis(payload),
  };
};

const getRecommendations = async (payload) => {
  const remote = await postJSON('/recommendations', payload);
  if (remote?.recommendations) return remote;

  return buildRecommendations(payload);
};

module.exports = {
  getTrustAnalysis,
  getRecommendations,
};
