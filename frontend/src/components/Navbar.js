import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiHome, FiBook, FiPlus, FiSettings } from 'react-icons/fi';

const Navbar = () => {
  const location = useLocation();
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const isActive = (path) => location.pathname === path;

  return (
    <Box
      as="nav"
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={6}
      py={4}
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      boxShadow="sm"
    >
      <Flex align="center">
        <Heading
          as={RouterLink}
          to="/"
          size="lg"
          color="brand.600"
          fontFamily="heading"
          _hover={{ textDecoration: 'none', color: 'brand.700' }}
        >
          NovelForge
        </Heading>

        <Spacer />

        <Flex align="center" gap={4}>
          <Button
            as={RouterLink}
            to="/"
            variant={isActive('/') ? 'solid' : 'ghost'}
            leftIcon={<FiHome />}
            size="sm"
          >
            Home
          </Button>

          <Button
            as={RouterLink}
            to="/dashboard"
            variant={isActive('/dashboard') ? 'solid' : 'ghost'}
            leftIcon={<FiBook />}
            size="sm"
          >
            My Novels
          </Button>

          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              variant="ghost"
              size="sm"
            >
              Create
            </MenuButton>
            <MenuList>
              <MenuItem as={RouterLink} to="/create" icon={<FiPlus />}>
                New Novel
              </MenuItem>
            </MenuList>
          </Menu>

          <Button
            as={RouterLink}
            to="/settings"
            variant={isActive('/settings') ? 'solid' : 'ghost'}
            leftIcon={<FiSettings />}
            size="sm"
          >
            Settings
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
