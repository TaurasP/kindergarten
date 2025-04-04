// "use client";

// import * as React from "react";
// import Link from "next/link";

// import { cn } from "@/lib/utils";
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
//   navigationMenuTriggerStyle,
// } from "./navigation-menu";
// import { AuthContext } from "@/context/AuthContext";
// import { useContext } from "react";

// export default function Navigation() {
//   const authContext = useContext(AuthContext);

//   return (
//     <NavigationMenu className="hidden md:flex">
//       <NavigationMenuList>
//         <NavigationMenuItem>
//           <Link
//             href={authContext?.isAuthenticated ? "/groups" : "/login"}
//             legacyBehavior
//             passHref
//           >
//             <NavigationMenuLink className={navigationMenuTriggerStyle()}>
//               Recipes
//             </NavigationMenuLink>
//           </Link>
//         </NavigationMenuItem>
//         {/* <NavigationMenuItem>
//           <Link
//             href={authContext?.isAuthenticated ? "/children" : "/login"}
//             legacyBehavior
//             passHref
//           >
//             <NavigationMenuLink className={navigationMenuTriggerStyle()}>
//               Favorite recipes
//             </NavigationMenuLink>
//           </Link>
//         </NavigationMenuItem> */}
//       </NavigationMenuList>
//     </NavigationMenu>
//   );
// }

// const ListItem = React.forwardRef<
//   React.ElementRef<"a">,
//   React.ComponentPropsWithoutRef<"a">
// >(({ className, title, children, ...props }, ref) => {
//   return (
//     <li>
//       <NavigationMenuLink asChild>
//         <a
//           ref={ref}
//           className={cn(
//             "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
//             className
//           )}
//           {...props}
//         >
//           <div className="text-sm font-medium leading-none">{title}</div>
//           <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
//             {children}
//           </p>
//         </a>
//       </NavigationMenuLink>
//     </li>
//   );
// });
// ListItem.displayName = "ListItem";
