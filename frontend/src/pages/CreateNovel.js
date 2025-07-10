import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Alert,
  AlertIcon,
  Checkbox,
  SimpleGrid,
  Badge,
  useToast,
  Spinner,
  Box,
  Icon,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiZap, FiSettings, FiBook } from 'react-icons/fi';
import { api } from '../services/api';

const CreateNovel = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [genres, setGenres] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    premise: '',
    genre: '',
    targetWordCount: 80000,
    chapters: 20,
    writingStyle: 'balanced',
    workflow: 'chapter-by-chapter',
    generatePremise: false,
    premiseKeywords: '',
    customInstructions: ''
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const response = await api.getGenres();
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      toast({
        title: 'Error',
        description: 'Failed to load genres',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generatePremise = async () => {
    if (!formData.genre) {
      toast({
        title: 'Genre Required',
        description: 'Please select a genre before generating a premise',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.generatePremise({
        genreId: formData.genre,
        keywords: formData.premiseKeywords
      });
      
      // Extract the first premise from the response
      const firstPremise = response.premises && response.premises.premises && response.premises.premises[0];
      if (firstPremise) {
        handleInputChange('premise', firstPremise.summary);
      } else {
        throw new Error('Invalid response format');
      }
      toast({
        title: 'Premise Generated!',
        description: 'AI has created a compelling premise for your novel',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating premise:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate premise. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNovel = async () => {
    if (!formData.title || !formData.premise || !formData.genre) {
      toast({
        title: 'Required Fields Missing',
        description: 'Please fill in title, premise, and genre',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createNovel({
        title: formData.title,
        premise: formData.premise,
        genre: formData.genre,
        targetWordCount: formData.targetWordCount,
        chapters: formData.chapters,
        writingStyle: formData.writingStyle,
        workflow: formData.workflow,
        customInstructions: formData.customInstructions
      });

      toast({
        title: 'Novel Created!',
        description: 'Your novel project has been created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate(`/novel/${response.data._id}`);
    } catch (error) {
      console.error('Error creating novel:', error);
      toast({
        title: 'Error',
        description: 'Failed to create novel. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Basic Information</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Novel Title</FormLabel>
                    <Input
                      placeholder="Enter your novel's title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      placeholder="Select a genre"
                      value={formData.genre}
                      onChange={(e) => handleInputChange('genre', e.target.value)}
                    >
                      {genres.map(genre => (
                        <option key={genre._id} value={genre._id}>
                          {genre.name} - {genre.description}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormLabel>Generate Premise with AI</FormLabel>
                    <VStack spacing={3} align="stretch">
                      <Input
                        placeholder="Keywords for premise generation (optional)"
                        value={formData.premiseKeywords}
                        onChange={(e) => handleInputChange('premiseKeywords', e.target.value)}
                      />
                      <Button
                        leftIcon={<Icon as={FiZap} />}
                        onClick={generatePremise}
                        isLoading={isLoading}
                        loadingText="Generating..."
                        colorScheme="purple"
                        variant="outline"
                      >
                        Generate Premise with AI
                      </Button>
                    </VStack>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Premise</FormLabel>
                    <Textarea
                      placeholder="Describe your novel's premise, main conflict, and key story elements..."
                      value={formData.premise}
                      onChange={(e) => handleInputChange('premise', e.target.value)}
                      rows={6}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        );

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Story Structure</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <FormControl>
                    <FormLabel>Target Word Count</FormLabel>
                    <NumberInput
                      value={formData.targetWordCount}
                      onChange={(valueString, valueNumber) => 
                        handleInputChange('targetWordCount', valueNumber || 80000)
                      }
                      min={20000}
                      max={200000}
                      step={5000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Typical novel length: 70,000-90,000 words
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Number of Chapters</FormLabel>
                    <NumberInput
                      value={formData.chapters}
                      onChange={(valueString, valueNumber) => 
                        handleInputChange('chapters', valueNumber || 20)
                      }
                      min={5}
                      max={50}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </SimpleGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <Heading size="md">Writing Preferences</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Writing Style</FormLabel>
                    <Select
                      value={formData.writingStyle}
                      onChange={(e) => handleInputChange('writingStyle', e.target.value)}
                    >
                      <option value="concise">Concise & Direct</option>
                      <option value="balanced">Balanced</option>
                      <option value="descriptive">Rich & Descriptive</option>
                      <option value="dialogue-heavy">Dialogue-Heavy</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Workflow Type</FormLabel>
                    <Select
                      value={formData.workflow}
                      onChange={(e) => handleInputChange('workflow', e.target.value)}
                    >
                      <option value="one-click">One-Click Generation</option>
                      <option value="chapter-by-chapter">Chapter-by-Chapter</option>
                      <option value="hybrid">Hybrid Approach</option>
                    </Select>
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      {formData.workflow === 'one-click' && 'Generate the entire novel at once'}
                      {formData.workflow === 'chapter-by-chapter' && 'Generate and review each chapter individually'}
                      {formData.workflow === 'hybrid' && 'Combine automated generation with manual editing'}
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Custom Instructions (Optional)</FormLabel>
                    <Textarea
                      placeholder="Any specific instructions for the AI (tone, style, character details, etc.)"
                      value={formData.customInstructions}
                      onChange={(e) => handleInputChange('customInstructions', e.target.value)}
                      rows={4}
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        );

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Card>
              <CardHeader>
                <Heading size="md">Review & Create</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <Box>
                      <Text fontWeight="bold">Title:</Text>
                      <Text>{formData.title}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Genre:</Text>
                      <Text>
                        {genres.find(g => g._id === formData.genre)?.name || 'Not selected'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Target Word Count:</Text>
                      <Text>{formData.targetWordCount.toLocaleString()} words</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold">Chapters:</Text>
                      <Text>{formData.chapters}</Text>
                    </Box>
                  </SimpleGrid>

                  <Divider />

                  <Box>
                    <Text fontWeight="bold" mb={2}>Premise:</Text>
                    <Text color="gray.600">{formData.premise}</Text>
                  </Box>

                  {formData.customInstructions && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="bold" mb={2}>Custom Instructions:</Text>
                        <Text color="gray.600">{formData.customInstructions}</Text>
                      </Box>
                    </>
                  )}
                </VStack>
              </CardBody>
            </Card>

            <Alert status="info">
              <AlertIcon />
              Your novel project will be created with the settings above. You can modify these later.
            </Alert>
          </VStack>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Button
            as={RouterLink}
            to="/dashboard"
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
          >
            Back to Dashboard
          </Button>
          <Heading size="lg">Create New Novel</Heading>
          <Text color="gray.600">
            Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Structure & Preferences' : 'Review & Create'}
          </Text>
        </VStack>

        {/* Progress indicator */}
        <HStack spacing={2}>
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <Badge
                colorScheme={stepNumber <= step ? 'blue' : 'gray'}
                variant={stepNumber === step ? 'solid' : 'outline'}
                px={3}
                py={1}
              >
                {stepNumber}
              </Badge>
              {stepNumber < 3 && <Box flex={1} h={1} bg={stepNumber < step ? 'blue.200' : 'gray.200'} />}
            </React.Fragment>
          ))}
        </HStack>

        {renderStepContent()}

        {/* Navigation buttons */}
        <HStack justify="space-between">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            isDisabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 3 ? (
            <Button
              colorScheme="blue"
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              colorScheme="green"
              leftIcon={<Icon as={FiBook} />}
              onClick={createNovel}
              isLoading={isLoading}
              loadingText="Creating..."
            >
              Create Novel
            </Button>
          )}
        </HStack>
      </VStack>
    </Container>
  );
};

export default CreateNovel;
