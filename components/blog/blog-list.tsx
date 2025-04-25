"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Calendar, Clock, Search, Tag, BookOpen, User,
  X, ArrowLeft, ArrowRight, SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { 
  Select, SelectContent, SelectGroup, SelectItem, 
  SelectLabel, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  readingTime: string;
  category: string;
  featured: boolean;
  author?: {
    id: number;
    username: string | null;  // Allow null username
    realName: string | null;
    avatarUrl: string | null;
  };
}

export interface BlogListProps {
  posts: BlogPost[];
  featuredPosts?: BlogPost[];
  categories: string[];
  showAuthorInfo?: boolean;
}

const POSTS_PER_PAGE = 6;

export default function BlogList({ 
  posts, 
  featuredPosts = [], 
  categories,
  showAuthorInfo = true 
}: BlogListProps) {
  // States for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(posts);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Update filtered posts when search or filters change
  useEffect(() => {
    let result = [...posts];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        post => 
          post.title.toLowerCase().includes(term) || 
          post.excerpt.toLowerCase().includes(term) ||
          post.category.toLowerCase().includes(term)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "date") {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === "asc" 
          ? titleA.localeCompare(titleB) 
          : titleB.localeCompare(titleA);
      }
    });
    
    setFilteredPosts(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [posts, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSortBy("date");
    setSortOrder("desc");
  };

  // Handle page change
  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      {/* Featured Posts Section - Only display if there are featured posts */}
      {featuredPosts.length > 0 && (
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">Featured Posts</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post) => (
              <Card key={post.slug} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <Badge className="mb-2">{post.category}</Badge>
                    {post.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="transition-colors hover:underline hover:text-primary"
                  >
                    <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                  </Link>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="mb-4 text-muted-foreground line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{post.readingTime}</span>
                    </div>
                  </div>
                </CardContent>
                {showAuthorInfo && post.author && (
                  <CardFooter className="flex items-center pt-4 border-t">
                    <div className="flex items-center">
                      {post.author.avatarUrl ? (
                        <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
                          <img
                            src={post.author.avatarUrl}
                            alt={post.author.realName || post.author?.username || 'Author'}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary/10">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-medium">
                        {post.author.realName || post.author?.username || 'Anonymous'}
                      </span>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search posts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute transform -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={sortBy === "date" && sortOrder === "desc"}
                  onCheckedChange={() => {
                    setSortBy("date");
                    setSortOrder("desc");
                  }}
                >
                  Latest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "date" && sortOrder === "asc"}
                  onCheckedChange={() => {
                    setSortBy("date");
                    setSortOrder("asc");
                  }}
                >
                  Oldest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "title" && sortOrder === "asc"}
                  onCheckedChange={() => {
                    setSortBy("title");
                    setSortOrder("asc");
                  }}
                >
                  Title (A-Z)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "title" && sortOrder === "desc"}
                  onCheckedChange={() => {
                    setSortBy("title");
                    setSortOrder("desc");
                  }}
                >
                  Title (Z-A)
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start w-full font-normal"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active filters display */}
        {(searchTerm || selectedCategory !== "all") && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {searchTerm && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Search className="w-3 h-3" />
                {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-xs h-7"
              onClick={resetFilters}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results information */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-muted-foreground">
          {filteredPosts.length === 0
            ? "No posts found"
            : `Showing ${(currentPage - 1) * POSTS_PER_PAGE + 1}-${
                Math.min(currentPage * POSTS_PER_PAGE, filteredPosts.length)
              } of ${filteredPosts.length} posts`}
        </span>
      </div>

      {/* Blog Posts Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
          {paginatedPosts.map((post) => (
            <Card key={post.slug} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <Badge className="inline-flex mb-2">{post.category}</Badge>
                <Link
                  href={`/blog/${post.slug}`}
                  className="transition-colors hover:underline hover:text-primary"
                >
                  <h3 className="text-xl font-bold line-clamp-2">{post.title}</h3>
                </Link>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="mb-4 text-muted-foreground line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{post.readingTime}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between pt-4 border-t">
                {showAuthorInfo && post.author ? (
                  <div className="flex items-center">
                    {post.author.avatarUrl ? (
                      <div className="w-8 h-8 mr-2 overflow-hidden rounded-full">
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.realName || post.author?.username || 'Author'}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary/10">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <span className="text-sm font-medium">
                      {post.author.realName || post.author?.username || 'Anonymous'}
                    </span>
                  </div>
                ) : (
                  <div></div>
                )}
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/blog/${post.slug}`}>
                    Read <BookOpen className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 mb-4 rounded-full bg-muted">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-bold">No posts found</h3>
          <p className="mb-4 text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
          <Button onClick={resetFilters} variant="secondary">
            Reset Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center mt-8 space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            // Show first page, current page, last page, and pages around current
            if (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            ) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  className="w-10 h-10"
                  onClick={() => changePage(page)}
                >
                  {page}
                </Button>
              );
            } else if (
              (page === 2 && currentPage > 3) ||
              (page === totalPages - 1 && currentPage < totalPages - 2)
            ) {
              return (
                <Button
                  key={page}
                  variant="outline"
                  className="w-10 h-10 disabled:opacity-100"
                  disabled
                >
                  ...
                </Button>
              );
            }
            return null;
          })}
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}