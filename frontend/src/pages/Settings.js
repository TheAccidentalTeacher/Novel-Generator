import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Box,
  FormControl,
  FormLabel,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Button,
  useToast,
  Card,
  CardBody,
  Divider,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { api } from '../services/api';

const Settings = () => {
  const [providers, setProviders] = useState({});
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchProviders();
    loadSavedSettings();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await api.fetchAIProviders();
      setProviders(response.providers);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI providers',
        status: 'error',
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const loadSavedSettings = () => {
    const savedProvider = localStorage.getItem('ai_provider') || 'openai';
    const savedModel = localStorage.getItem('ai_model') || '';
    const savedTemp = parseFloat(localStorage.getItem('ai_temperature')) || 0.7;
    const savedTokens = parseInt(localStorage.getItem('ai_max_tokens')) || 2000;

    setSelectedProvider(savedProvider);
    setSelectedModel(savedModel);
    setTemperature(savedTemp);
    setMaxTokens(savedTokens);
  };

  const saveSettings = () => {
    localStorage.setItem('ai_provider', selectedProvider);
    localStorage.setItem('ai_model', selectedModel);
    localStorage.setItem('ai_temperature', temperature.toString());
    localStorage.setItem('ai_max_tokens', maxTokens.toString());

    toast({
      title: 'Settings Saved',
      description: 'Your AI preferences have been saved',
      status: 'success',
      duration: 3000,
    });
  };

  const getCurrentProviderModels = () => {
    if (!providers[selectedProvider]) return {};
    if (selectedProvider === 'replicate') {
      return providers[selectedProvider].text || {};
    }
    return providers[selectedProvider].models || {};
  };

  const getModelTier = (modelKey, modelInfo) => {
    if (modelInfo.costTier) return modelInfo.costTier;
    if (modelKey.includes('405b')) return 'premium';
    if (modelKey.includes('70b') || modelKey.includes('gpt-4')) return 'standard';
    return 'budget';
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'premium': return 'purple';
      case 'standard': return 'blue';
      case 'budget': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container maxW="4xl" py={8}>
        <Text>Loading settings...</Text>
      </Container>
    );
  }

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Heading size="lg">AI Settings</Heading>
          <Text color="gray.600">
            Configure your AI providers and model preferences
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Provider Selection */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">AI Provider</Heading>
                
                <FormControl>
                  <FormLabel>Select Provider</FormLabel>
                  <Select 
                    value={selectedProvider} 
                    onChange={(e) => {
                      setSelectedProvider(e.target.value);
                      setSelectedModel('');
                    }}
                  >
                    {Object.keys(providers).map((providerKey) => (
                      <option key={providerKey} value={providerKey}>
                        {providers[providerKey].name || providerKey}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>Select Model</FormLabel>
                  <Select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    placeholder="Choose a model"
                  >
                    {Object.entries(getCurrentProviderModels()).map(([modelKey, modelInfo]) => (
                      <option key={modelKey} value={modelKey}>
                        {modelInfo.name || modelKey}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedModel && getCurrentProviderModels()[selectedModel] && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={2}>
                      <Badge colorScheme={getTierColor(getModelTier(selectedModel, getCurrentProviderModels()[selectedModel]))}>
                        {getModelTier(selectedModel, getCurrentProviderModels()[selectedModel])}
                      </Badge>
                      <Text fontSize="sm" color="gray.600">
                        {getCurrentProviderModels()[selectedModel].description}
                      </Text>
                    </VStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Generation Parameters */}
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <Heading size="md">Generation Parameters</Heading>
                
                <FormControl>
                  <FormLabel>Temperature: {temperature}</FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Controls randomness (0.0 = focused, 1.0 = creative)
                  </Text>
                  <Slider
                    value={temperature}
                    onChange={setTemperature}
                    min={0}
                    max={1}
                    step={0.1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel>Max Tokens: {maxTokens}</FormLabel>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Maximum length of generated text
                  </Text>
                  <Slider
                    value={maxTokens}
                    onChange={setMaxTokens}
                    min={500}
                    max={4000}
                    step={100}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                </FormControl>

                <Button colorScheme="blue" onClick={saveSettings}>
                  Save Settings
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Divider />

        {/* Provider Information */}
        <Box>
          <Heading size="md" mb={4}>Available Providers</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>OpenAI</StatLabel>
                  <StatNumber>GPT-4 Family</StatNumber>
                  <StatHelpText>Premium quality, reliable performance</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Replicate</StatLabel>
                  <StatNumber>Llama 3.1 & More</StatNumber>
                  <StatHelpText>Cost-effective, diverse model options</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
};

export default Settings;
