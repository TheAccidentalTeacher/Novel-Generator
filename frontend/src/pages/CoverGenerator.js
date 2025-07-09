import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

const CoverGenerator = () => {
  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Heading size="lg">Cover Generator</Heading>
          <Text color="gray.600">
            Create professional book covers with AI
          </Text>
        </VStack>

        <Alert status="info">
          <AlertIcon />
          Cover generator coming soon! This will include template-based generation, 
          custom prompts, and automated visual element extraction.
        </Alert>
      </VStack>
    </Container>
  );
};

export default CoverGenerator;
