import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Stack,
  Icon,
  useColorModeValue,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiBook, FiPenTool, FiImage, FiZap } from 'react-icons/fi';

const Home = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const accentColor = useColorModeValue('brand.50', 'brand.900');

  const features = [
    {
      icon: FiPenTool,
      title: 'AI-Powered Writing',
      description: 'Generate compelling novels with GPT-4 technology, tailored to your chosen genre and style.',
      color: 'blue',
    },
    {
      icon: FiBook,
      title: 'Genre Expertise',
      description: 'Specialized templates for Christian Fiction, Mystery, Romance, and more with authentic genre conventions.',
      color: 'green',
    },
    {
      icon: FiImage,
      title: 'Cover Generation',
      description: 'Create professional book covers with DALL-E integration and publishing-ready formats.',
      color: 'purple',
    },
    {
      icon: FiZap,
      title: 'Multiple Workflows',
      description: 'Choose from one-click generation, chapter-by-chapter control, or hybrid approaches.',
      color: 'orange',
    },
  ];

  const genres = [
    { name: 'Christian Fiction', color: 'christian', priority: true },
    { name: 'Mystery', color: 'mystery', priority: true },
    { name: 'Cozy Mystery', color: 'gray', priority: true },
    { name: 'Romance', color: 'pink' },
    { name: 'Thriller', color: 'red' },
    { name: 'Historical Fiction', color: 'brown' },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box bg={accentColor} py={20}>
        <Container maxW="6xl">
          <VStack spacing={8} textAlign="center">
            <Heading
              size="2xl"
              fontWeight="bold"
              color="brand.700"
              fontFamily="heading"
            >
              Forge Your Next Novel with AI
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Transform your ideas into compelling novels with our AI-powered writing platform. 
              From premise to publication-ready manuscript, NovelForge guides you through every step.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/create"
                size="lg"
                colorScheme="brand"
                rightIcon={<Icon as={FiPenTool} />}
              >
                Start Writing
              </Button>
              <Button
                as={RouterLink}
                to="/dashboard"
                size="lg"
                variant="outline"
                rightIcon={<Icon as={FiBook} />}
              >
                My Novels
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="6xl" py={16}>
        <VStack spacing={12}>
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="gray.700">
              Everything You Need to Write
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Our comprehensive platform provides all the tools and guidance you need 
              to create professional-quality novels in your favorite genres.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {features.map((feature, index) => (
              <Card key={index} bg={cardBg} shadow="md" _hover={{ shadow: 'lg' }}>
                <CardBody>
                  <VStack spacing={4} align="start">
                    <Icon
                      as={feature.icon}
                      w={8}
                      h={8}
                      color={`${feature.color}.500`}
                    />
                    <Stack spacing={2}>
                      <Heading size="md" color="gray.700">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {feature.description}
                      </Text>
                    </Stack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Genres Section */}
      <Box bg="gray.100" py={16}>
        <Container maxW="6xl">
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Heading size="xl" color="gray.700">
                Specialized Genre Support
              </Heading>
              <Text fontSize="lg" color="gray.600" maxW="2xl">
                Our AI understands the unique conventions, character archetypes, 
                and reader expectations of different fiction genres.
              </Text>
            </VStack>

            <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={4}>
              {genres.map((genre, index) => (
                <VStack key={index} spacing={2}>
                  <Badge
                    colorScheme={genre.color}
                    fontSize="sm"
                    px={3}
                    py={2}
                    borderRadius="md"
                    variant={genre.priority ? 'solid' : 'outline'}
                  >
                    {genre.name}
                  </Badge>
                  {genre.priority && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Priority Genre
                    </Text>
                  )}
                </VStack>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxW="6xl" py={16}>
        <Card bg="brand.500" color="white" textAlign="center">
          <CardBody py={12}>
            <VStack spacing={6}>
              <Heading size="xl">Ready to Start Your Novel?</Heading>
              <Text fontSize="lg" maxW="xl">
                Join the revolution of AI-assisted creative writing. 
                Create your first novel with NovelForge today.
              </Text>
              <Button
                as={RouterLink}
                to="/create"
                size="lg"
                bg="white"
                color="brand.500"
                _hover={{ bg: 'gray.100' }}
                rightIcon={<Icon as={FiPenTool} />}
              >
                Create Your First Novel
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Home;
