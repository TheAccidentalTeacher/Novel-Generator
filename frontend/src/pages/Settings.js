import React from 'react';
import {
  Container,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

const Settings = () => {
  return (
    <Container maxW="4xl" py={8}>
      <VStack spacing={8} align="stretch">
        <VStack align="start" spacing={2}>
          <Heading size="lg">Settings</Heading>
          <Text color="gray.600">
            Configure your NovelForge preferences
          </Text>
        </VStack>

        <Alert status="info">
          <AlertIcon />
          Settings page coming soon! This will include API configuration, 
          default preferences, and user customizations.
        </Alert>
      </VStack>
    </Container>
  );
};

export default Settings;
