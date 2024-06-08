import Image from "next/image";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
 
} from "@material-tailwind/react";

interface EventContentCardProps {
  title: string;
  des: string;
  
  panel: string;
  img: string;
}
export function EventContentCard({
  title,
  des,
  
  panel,
  img,
}: EventContentCardProps) {
  return (
    <Card
      color="transparent"
      shadow={false}
      className="lg:!flex-row mb-10 lg:items-end"
      placeholder=""
      onPointerEnterCapture={() => {}}
      onPointerLeaveCapture={() => {}}
    >
      <CardHeader
        floated={false}
        shadow={false}
        className="h-[32rem] max-w-[28rem] shrink-0"
        placeholder=""
        onPointerEnterCapture={() => {}}
        onPointerLeaveCapture={() => {}}
      >
        <Image
          width={768}
          height={768}
          src={img}
          alt="testimonial image"
          className="h-full w-full object-cover"
        />
      </CardHeader>
      <CardBody className="col-span-full lg:col-span-3"
       placeholder=""
       onPointerEnterCapture={() => {}}
       onPointerLeaveCapture={() => {}}>
        <Typography variant="h6" color="blue-gray" className="mb-4"
         placeholder=""
         onPointerEnterCapture={() => {}}
         onPointerLeaveCapture={() => {}}>
          {panel}
        </Typography>
        <Typography variant="h2" color="blue-gray" className="mb-4 font-medium"
         placeholder=""
         onPointerEnterCapture={() => {}}
         onPointerLeaveCapture={() => {}}>
          {title}
        </Typography>
        <Typography className="mb-12 md:w-8/12 font-medium !text-gray-500"
         placeholder=""
         onPointerEnterCapture={() => {}}
         onPointerLeaveCapture={() => {}}>
          {des}
        </Typography>
       
      </CardBody>
    </Card>
  );
}

export default EventContentCard;
