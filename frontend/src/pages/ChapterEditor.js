import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Textarea,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  useToast,
  Spinner,
  Box,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  FiArrowLeft, 
  FiSave, 
  FiEdit, 
  FiEye,
  FiWand2,
  FiRefreshCw,
  FiSettings,
  FiFileText,
  FiClock,
  FiMoreVertical,
  FiPlay,
  FiPause
} from 'react-icons/fi';
import { api } from '../services/api';

const ChapterEditor = () => {
  const { novelId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const textareaRef = useRef(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [chapterData, setChapterData] = useState({
    title: '',
    content: '',
    summary: '',
    notes: ''
  });
  const [wordCount, setWordCount] = useState(0);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  
  const { isOpen: isGenerateOpen, onOpen: onGenerateOpen, onClose: onGenerateClose } = useDisclosure();
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Mock chapter data for demonstration
  const mockChapter = {
    id: chapterNumber,
    title: `Chapter ${chapterNumber}: The Journey Begins`,
    content: `The morning mist clung to the cemetery like a shroud, obscuring the weathered headstones and ancient oak trees that had stood sentinel for generations. Pastor David Matthews walked the familiar path between the graves, his footsteps muffled by the dew-dampened grass. He had come here every morning for the past fifteen years, finding solace in the quiet communion with those who had gone before.

But today was different.

Where yesterday there had been only bare earth beside the old stone chapel, now a garden bloomed in impossible abundance. Roses climbed toward heaven in spirals of crimson and gold, their petals untouched by the early frost that had claimed the last of the autumn flowers. Lavender and rosemary released their fragrance into the cool air, while morning glories opened their faces to greet the dawn.

David stopped at the garden's edge, his breath catching in his throat. In all his years of ministry, he had seen many mysteries, but nothing quite like this. The soil here had been barren, rocky—unsuitable for anything more ambitious than wild grass. Yet somehow, overnight, it had been transformed into something that belonged more in Eden than in Millfield Cemetery.

"It's beautiful, isn't it?"

David turned to find Mrs. Eleanor Hartwell approaching, her silver hair gleaming in the filtered sunlight. At eighty-three, she was the oldest member of his congregation and, some said, the wisest.

"Eleanor," he said, his voice barely above a whisper. "When did this... how did this happen?"

She smiled, her eyes twinkling with something that might have been mischief. "Some things, Pastor, aren't meant to be explained. They're meant to be received."

David knelt beside a cluster of white lilies, their blooms so perfect they seemed almost artificial. But when he touched one gently, it responded with the yielding softness of living petals. The soil beneath was rich and dark, fragrant with life.

"The cemetery committee will want answers," he said, though his tone suggested he wasn't entirely sure he wanted to provide them.

"Will they?" Eleanor asked. "Or will they want to believe in something beautiful for once?"

As if in response to her words, the morning sun broke through the mist, setting the garden ablaze with golden light. David felt something stir in his chest—not doubt, which had been his constant companion these past months, but something else entirely. Something that felt remarkably like hope.`,
    summary: 'Pastor David discovers a mysterious garden that appeared overnight in the cemetery, challenging his faith and opening his heart to wonder.',
    notes: 'Consider adding more sensory details about the flowers. Maybe include a flashback to David\'s recent struggles with doubt.',
    status: 'draft',
    wordCount: 425,
    lastEdited: new Date(),
    version: 1
  };

  useEffect(() => {
    setChapterData(mockChapter);
    setWordCount(mockChapter.content.split(/\s+/).length);
  }, [chapterNumber]);

  useEffect(() => {
    if (chapterData.content) {
      const words = chapterData.content.trim().split(/\s+/).length;
      setWordCount(words);
    }
  }, [chapterData.content]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setChapterData(prev => ({ ...prev, content: newContent }));
    
    if (autoSave) {
      // Debounced auto-save would go here
      setLastSaved(new Date());
    }
  };

  const handleSave = () => {
    toast({
      title: 'Chapter Saved',
      description: 'Your changes have been saved successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
    setLastSaved(new Date());
  };

  const handleGenerate = () => {
    toast({
      title: 'Generating Chapter',
      description: 'AI is generating new content for this chapter...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    onGenerateClose();
  };

  const handleReview = () => {
    toast({
      title: 'Chapter Review',
      description: 'AI review and suggestions will be available soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="7xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <VStack align="start" spacing={4}>
          <HStack>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/novel/${novelId}`)}
            >
              Back to Novel
            </Button>
            <Badge colorScheme="blue" fontSize="sm">
              {mockChapter.status}
            </Badge>
          </HStack>
          
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={1}>
              <Heading size="lg">{chapterData.title}</Heading>
              <HStack spacing={4} fontSize="sm" color="gray.500">
                <Text>Novel: The Last Garden</Text>
                <Text>•</Text>
                <Text>{wordCount} words</Text>
                <Text>•</Text>
                <Text>
                  {lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'Not saved'}
                </Text>
              </HStack>
            </VStack>
            
            <HStack>
              <Button
                leftIcon={<FiWand2 />}
                colorScheme="purple"
                variant="outline"
                onClick={onGenerateOpen}
              >
                AI Generate
              </Button>
              <Button
                leftIcon={<FiEye />}
                colorScheme="blue"
                variant="outline"
                onClick={handleReview}
              >
                AI Review
              </Button>
              <Button
                leftIcon={<FiSave />}
                colorScheme="green"
                onClick={handleSave}
              >
                Save
              </Button>
              <Menu>
                <MenuButton as={Button} leftIcon={<FiMoreVertical />} variant="ghost">
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<FiSettings />} onClick={onSettingsOpen}>
                    Chapter Settings
                  </MenuItem>
                  <MenuItem icon={<FiRefreshCw />}>
                    Revert Changes
                  </MenuItem>
                  <MenuItem icon={<FiFileText />}>
                    Export Chapter
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </HStack>
        </VStack>

        {/* Stats Bar */}
        <Card bg={cardBg}>
          <CardBody>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              <Stat size="sm">
                <StatLabel>Word Count</StatLabel>
                <StatNumber>{wordCount.toLocaleString()}</StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel>Target</StatLabel>
                <StatNumber>3,500</StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel>Reading Time</StatLabel>
                <StatNumber>{Math.ceil(wordCount / 250)} min</StatNumber>
              </Stat>
              <Stat size="sm">
                <StatLabel>Version</StatLabel>
                <StatNumber>{mockChapter.version}</StatNumber>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Editor */}
        <HStack spacing={6} align="start">
          {/* Content Editor */}
          <Box flex={3}>
            <Card bg={cardBg} minH="600px">
              <CardHeader>
                <HStack justify="space-between">
                  <Heading size="md">Chapter Content</Heading>
                  <HStack>
                    <Switch
                      isChecked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      size="sm"
                    />
                    <Text fontSize="sm">Auto-save</Text>
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Chapter Title</FormLabel>
                    <Input
                      value={chapterData.title}
                      onChange={(e) => setChapterData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Content</FormLabel>
                    <Textarea
                      ref={textareaRef}
                      value={chapterData.content}
                      onChange={handleContentChange}
                      placeholder="Start writing your chapter..."
                      rows={20}
                      resize="vertical"
                      fontSize="16px"
                      lineHeight="1.6"
                      fontFamily="'Georgia', serif"
                    />
                  </FormControl>
                </VStack>
              </CardBody>
            </Card>
          </Box>

          {/* Side Panel */}
          <Box flex={1}>
            <VStack spacing={4} align="stretch">
              {/* Chapter Summary */}
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="sm">Chapter Summary</Heading>
                </CardHeader>
                <CardBody>
                  <Textarea
                    value={chapterData.summary}
                    onChange={(e) => setChapterData(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Brief summary of this chapter..."
                    rows={3}
                    fontSize="sm"
                  />
                </CardBody>
              </Card>

              {/* Notes */}
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="sm">Notes & Ideas</Heading>
                </CardHeader>
                <CardBody>
                  <Textarea
                    value={chapterData.notes}
                    onChange={(e) => setChapterData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notes, ideas, reminders..."
                    rows={4}
                    fontSize="sm"
                  />
                </CardBody>
              </Card>

              {/* Quick Actions */}
              <Card bg={cardBg}>
                <CardHeader>
                  <Heading size="sm">Quick Actions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={2}>
                    <Button size="sm" w="full" leftIcon={<FiWand2 />} variant="outline">
                      Generate Next Paragraph
                    </Button>
                    <Button size="sm" w="full" leftIcon={<FiRefreshCw />} variant="outline">
                      Rephrase Selection
                    </Button>
                    <Button size="sm" w="full" leftIcon={<FiEye />} variant="outline">
                      Grammar Check
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </Box>
        </HStack>

        {/* Generate Chapter Modal */}
        <Modal isOpen={isGenerateOpen} onClose={onGenerateClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Generate Chapter Content</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  AI will generate content based on your novel's premise, characters, and previous chapters.
                </Alert>
                
                <FormControl>
                  <FormLabel>Generation Type</FormLabel>
                  <Menu>
                    <MenuButton as={Button} w="full" rightIcon={<FiMoreVertical />}>
                      Complete Chapter
                    </MenuButton>
                    <MenuList>
                      <MenuItem>Complete Chapter</MenuItem>
                      <MenuItem>Continue from current content</MenuItem>
                      <MenuItem>Specific scene or section</MenuItem>
                    </MenuList>
                  </Menu>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Additional Instructions</FormLabel>
                  <Textarea
                    placeholder="Any specific instructions for the AI (tone, events, character focus, etc.)"
                    rows={4}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onGenerateClose}>
                Cancel
              </Button>
              <Button colorScheme="purple" onClick={handleGenerate}>
                Generate Content
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Settings Modal */}
        <Modal isOpen={isSettingsOpen} onClose={onSettingsClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Chapter Settings</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Target Word Count</FormLabel>
                  <Input type="number" defaultValue="3500" />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Writing Style</FormLabel>
                  <Menu>
                    <MenuButton as={Button} w="full" rightIcon={<FiMoreVertical />}>
                      Match Novel Style
                    </MenuButton>
                  </Menu>
                </FormControl>
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Auto-save enabled
                  </FormLabel>
                  <Switch isChecked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onSettingsClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={onSettingsClose}>
                Save Settings
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default ChapterEditor;
