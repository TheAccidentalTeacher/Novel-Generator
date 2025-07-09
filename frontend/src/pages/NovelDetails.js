import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Progress,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  useToast,
  Spinner,
  Box,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiPlay, 
  FiPause, 
  FiSettings, 
  FiBook,
  FiFileText,
  FiUsers,
  FiImage,
  FiTrendingUp,
  FiMoreVertical,
  FiPlus,
  FiEye,
  FiDownload
} from 'react-icons/fi';
import { api } from '../services/api';

const NovelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState(0);
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const { data: novelData, isLoading, error } = useQuery(
    ['novel', id],
    () => api.fetchNovel(id),
    {
      enabled: !!id,
      onError: (error) => {
        console.error('Error fetching novel:', error);
        toast({
          title: 'Error',
          description: 'Failed to load novel details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  );

  const novel = novelData?.data;

  // Mock chapter data for demonstration
  const mockChapters = [
    { id: 1, title: 'The Beginning', status: 'completed', wordCount: 3500, lastEdited: '2024-01-15' },
    { id: 2, title: 'First Encounter', status: 'completed', wordCount: 4200, lastEdited: '2024-01-16' },
    { id: 3, title: 'The Mystery Deepens', status: 'completed', wordCount: 3800, lastEdited: '2024-01-17' },
    { id: 4, title: 'Revelations', status: 'draft', wordCount: 2100, lastEdited: '2024-01-18' },
    { id: 5, title: 'The Plot Thickens', status: 'outline', wordCount: 0, lastEdited: null },
  ];

  const statusColors = {
    planning: 'blue',
    outlining: 'cyan',
    drafting: 'yellow',
    reviewing: 'orange',
    completed: 'green',
    paused: 'gray',
  };

  const chapterStatusColors = {
    completed: 'green',
    draft: 'yellow',
    outline: 'blue',
    reviewing: 'orange',
  };

  if (error) {
    return (
      <Container maxW="6xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load novel details. Please try again.
        </Alert>
      </Container>
    );
  }

  if (isLoading || !novel) {
    return (
      <Container maxW="6xl" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" />
          <Text>Loading novel details...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="6xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <VStack align="start" spacing={4}>
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </Button>
          
          <HStack justify="space-between" w="full">
            <VStack align="start" spacing={2}>
              <HStack>
                <Heading size="xl">{novel.title}</Heading>
                <Badge colorScheme={statusColors[novel.status]} fontSize="md" px={3} py={1}>
                  {novel.status.charAt(0).toUpperCase() + novel.status.slice(1)}
                </Badge>
              </HStack>
              <HStack>
                <Badge variant="outline" colorScheme="blue">
                  {novel.genre.primary}
                </Badge>
                <Text color="gray.500">
                  Created {format(new Date(novel.createdAt), 'MMMM d, yyyy')}
                </Text>
              </HStack>
            </VStack>
            
            <Menu>
              <MenuButton as={Button} rightIcon={<FiMoreVertical />}>
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiEdit />}>Edit Settings</MenuItem>
                <MenuItem icon={<FiPlay />}>Continue Writing</MenuItem>
                <MenuItem icon={<FiDownload />}>Export</MenuItem>
                <MenuItem icon={<FiSettings />}>Novel Settings</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </VStack>

        {/* Progress Overview */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Progress Overview</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
              <Stat>
                <StatLabel>Completion</StatLabel>
                <StatNumber>{novel.progress?.percentComplete || 0}%</StatNumber>
                <StatHelpText>
                  <Progress 
                    value={novel.progress?.percentComplete || 0} 
                    colorScheme="green" 
                    size="sm" 
                    mt={2} 
                  />
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Words Written</StatLabel>
                <StatNumber>{(novel.progress?.wordsWritten || 0).toLocaleString()}</StatNumber>
                <StatHelpText>
                  of {novel.targetWordCount?.toLocaleString() || '80,000'} target
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Chapters</StatLabel>
                <StatNumber>
                  {novel.progress?.currentChapter || 0} / {novel.progress?.totalChapters || 0}
                </StatNumber>
                <StatHelpText>
                  {novel.progress?.totalChapters - novel.progress?.currentChapter || 0} remaining
                </StatHelpText>
              </Stat>
              
              <Stat>
                <StatLabel>Estimated Completion</StatLabel>
                <StatNumber>2 weeks</StatNumber>
                <StatHelpText>Based on current pace</StatHelpText>
              </Stat>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Main Content Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab} variant="line">
          <TabList>
            <Tab>
              <Icon as={FiBook} mr={2} />
              Overview
            </Tab>
            <Tab>
              <Icon as={FiFileText} mr={2} />
              Chapters
            </Tab>
            <Tab>
              <Icon as={FiUsers} mr={2} />
              Characters
            </Tab>
            <Tab>
              <Icon as={FiImage} mr={2} />
              Covers
            </Tab>
            <Tab>
              <Icon as={FiTrendingUp} mr={2} />
              Analytics
            </Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg}>
                  <CardHeader>
                    <Heading size="md">Premise</Heading>
                  </CardHeader>
                  <CardBody>
                    <Text color="gray.600" lineHeight="tall">
                      {novel.premise}
                    </Text>
                  </CardBody>
                </Card>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="md">Writing Details</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="start" spacing={3}>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium">Target Length:</Text>
                          <Text>{novel.targetWordCount?.toLocaleString() || 'Not set'} words</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium">Genre:</Text>
                          <Text>{novel.genre.primary}</Text>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium">Status:</Text>
                          <Badge colorScheme={statusColors[novel.status]}>
                            {novel.status}
                          </Badge>
                        </HStack>
                        <HStack justify="space-between" w="full">
                          <Text fontWeight="medium">Last Updated:</Text>
                          <Text>{format(new Date(novel.createdAt), 'MMM d, yyyy')}</Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg}>
                    <CardHeader>
                      <Heading size="md">Quick Actions</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3}>
                        <Button
                          leftIcon={<FiPlay />}
                          colorScheme="blue"
                          size="sm"
                          w="full"
                          as={RouterLink}
                          to={`/novel/${novel._id}/chapter/${(novel.progress?.currentChapter || 0) + 1}`}
                        >
                          Continue Writing
                        </Button>
                        <Button
                          leftIcon={<FiPlus />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          Add Chapter
                        </Button>
                        <Button
                          leftIcon={<FiUsers />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          Manage Characters
                        </Button>
                        <Button
                          leftIcon={<FiImage />}
                          variant="outline"
                          size="sm"
                          w="full"
                        >
                          Generate Cover
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </VStack>
            </TabPanel>

            {/* Chapters Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <HStack justify="space-between">
                  <Heading size="md">Chapters</Heading>
                  <Button leftIcon={<FiPlus />} colorScheme="blue" size="sm">
                    Add Chapter
                  </Button>
                </HStack>

                <Card bg={cardBg}>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Chapter</Th>
                            <Th>Title</Th>
                            <Th>Status</Th>
                            <Th>Words</Th>
                            <Th>Last Edited</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {mockChapters.map((chapter) => (
                            <Tr key={chapter.id}>
                              <Td>{chapter.id}</Td>
                              <Td>{chapter.title}</Td>
                              <Td>
                                <Badge colorScheme={chapterStatusColors[chapter.status]}>
                                  {chapter.status}
                                </Badge>
                              </Td>
                              <Td>{chapter.wordCount.toLocaleString()}</Td>
                              <Td>
                                {chapter.lastEdited 
                                  ? format(new Date(chapter.lastEdited), 'MMM d') 
                                  : '-'
                                }
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button 
                                    size="xs" 
                                    leftIcon={<FiEye />}
                                    as={RouterLink}
                                    to={`/novel/${novel._id}/chapter/${chapter.id}`}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    size="xs" 
                                    leftIcon={<FiEdit />} 
                                    variant="outline"
                                    as={RouterLink}
                                    to={`/novel/${novel._id}/chapter/${chapter.id}/edit`}
                                  >
                                    Edit
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Characters Tab */}
            <TabPanel>
              <Alert status="info">
                <AlertIcon />
                Character management coming soon! This will include character profiles, 
                relationships, and AI-generated character development.
              </Alert>
            </TabPanel>

            {/* Covers Tab */}
            <TabPanel>
              <Alert status="info">
                <AlertIcon />
                Cover generation and management coming soon! This will include AI-generated 
                covers, variations, and publishing-ready formats.
              </Alert>
            </TabPanel>

            {/* Analytics Tab */}
            <TabPanel>
              <Alert status="info">
                <AlertIcon />
                Writing analytics coming soon! This will include writing pace, word count trends, 
                and progress insights.
              </Alert>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default NovelDetails;
