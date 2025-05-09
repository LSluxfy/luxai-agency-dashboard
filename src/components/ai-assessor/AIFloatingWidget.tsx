
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MessageSquare, X } from "lucide-react";
import AIChat from "./AIChat";
import { motion, AnimatePresence } from "framer-motion";

type AIFloatingWidgetProps = {
  userId?: string;
  onConversationAdded?: () => void;
  openByDefault?: boolean;
};

const AIFloatingWidget = ({
  userId,
  onConversationAdded,
  openByDefault = false,
}: AIFloatingWidgetProps) => {
  const [isOpen, setIsOpen] = useState(openByDefault);

  if (!userId) return null;

  return (
    <>
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 rounded-full shadow-lg z-50 size-12 p-0"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={20} />
        </Button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-4 right-4 w-80 md:w-96 z-50"
          >
            <Card className="shadow-xl">
              <CardHeader className="p-4 bg-primary text-primary-foreground flex flex-row items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  <MessageSquare size={16} />
                  Assessor IA
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary/90"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={16} />
                </Button>
              </CardHeader>
              <CardContent className="p-3 max-h-[60vh] overflow-y-auto">
                <AIChat
                  userId={userId}
                  onConversationAdded={onConversationAdded}
                  isWidget={true}
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIFloatingWidget;
